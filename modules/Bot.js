let BotSettings = require('./BotSettings');
let Order = require('./Order');
let Pair = require('./Pair');
const Crypto = require('../modules/Crypto');
const Symbols = require('./Symbols');
let binanceAPI = require('binance-api-node').default;
const WSS = require('./WSS');
const TradingSignals = require('../modules/TradingSignals');
let Mongo = require('./Mongo');
let sleep = require('system-sleep');
const md5 = require('md5');
const uniqid = require('uniqid');

const Process = require('./Process');

const CONSTANTS = require('../constants');
const BT = CONSTANTS.BT;

module.exports = class Bot {
	constructor({
		title = 'Untitled bot',
		state = CONSTANTS.BOT_STATE.MANUAL,
		status = CONSTANTS.BOT_STATUS.INACTIVE,
		freeze = CONSTANTS.BOT_FREEZE_STATUS.INACTIVE,
		preFreeze = freeze,
		botID = uniqid(BT),
		pair = {},
		currentOrder = {},
		orders = [],
		safeOrders = [],
		freezeOrders = {
			safe: [],
			current: {},
		},
		botSettings = {},
		log = [],
		processes = {},
		Client = {}
	} = {}, user = {}) {
		this.title = title;
		this.state = state;
		this.status = status;
		this.freeze = freeze;
		this.preFreeze = preFreeze;
		this.pair = new Pair(pair.from, pair.to, pair.requested);
		this.botSettings = new BotSettings(botSettings);
		this.botID = botID;
		this.processes = processes;
		this.user = user;


		// this.orders = orders;
		// this.safeOrders = safeOrders;
		// this.currentOrder = currentOrder;
		// this.freezeOrders = freezeOrders;
		// this.log = log;
		// this.Client = Client;
		// if(user.name) this.setClient(user);
	}

	continueTrade(user = this.user) {
		console.log('continueTrade');
		for (let _id in this.processes) {
			if(this.processes[_id] && this.processes[_id].runningProcess) {
				this.processes[_id] = new Process(this.processes[_id]);
				this.processes[_id].continueTrade(user);
			}
		}
	}

	async changeStatus(nextStatus, user = this.user) {
		let message = '',
			status = '';
		
		if(this.checkForActivate(nextStatus)) {
			this.status = nextStatus;
			console.log('activate bot');
			
			if(this.isManual()) {
				this.botSettings.decimalQty = await Symbols.getLotSize(this.getPair());
				status = 'ok';
				message = 'Бот запущен (РУЧНОЙ)';
				await this.updateBot(user);
				this.startManual(user);
			}
			else if(this.isAuto()) {
				status = 'ok';
				message = 'Бот запущен (АВТО)';
				await this.updateBot(user);
				this.startAuto(user);
			}
			else {
				status = 'error';	
				message = "Ошибка (НЕИЗВЕСТНЫЙ ТИП БОТА)";
				this.status = CONSTANTS.BOT_STATUS.INACTIVE;
			}
		}
		else if(this.checkForDeactivate(nextStatus)) {
			this.status = nextStatus;
			for (let _id in this.processes) {
				this.processes[_id] = new Process(this.processes[_id]).deactivateProcess();
			}
			status = 'info';
			message = "Бот перестанет работать после завершения всех рабочих циклов.";
			await this.updateBot(user); 
		}
		else {
			this.status = CONSTANTS.BOT_STATUS.INACTIVE;
			status = 'error';
			message = "Возможно вы пытаетесь включить бота, который не завершил свой последний цикл.";
			await this.updateBot(user);
		}

		return {
			status: status,
			data: { status: this.status },
			message: message
		};
	}

	async changeFreeze(nextFreeze, user) {
		console.log('[------- changeFreeze')
		const active = CONSTANTS.BOT_FREEZE_STATUS.ACTIVE,
			inactive = CONSTANTS.BOT_FREEZE_STATUS.INACTIVE
		let res = {
			status: 'error',
			message: 'Получены неверные данные.'
		}
		if(nextFreeze === inactive) {
			console.log('------- inactive')
			this.preFreeze = this.freeze
			this.freeze = inactive

			res = {
				status: 'info',
				data: { freeze: this.freeze },
				message: 'Процессы будут разморожены.'
			}
		}
		else if(nextFreeze === active) {
			console.log('------- active')
			this.preFreeze = this.freeze
			this.freeze = active
			res = {
				status: 'info',
				data: { freeze: this.freeze },
				message: 'Процессы будут заморожены.'
			}
		}
		for (let _id in this.processes) {
			this.processes[_id].changeFreeze(this.freeze, this.preFreeze);
		}
		await this.updateBot(user);
		console.log(']------- changeFreeze');
		return res
	}

	//:: START FUNC
	async startManual(user = this.user) {
		console.log('startManual');
		// if(Object.keys(this.processes).length === 0) {
			let resObj = {
				symbol: this.getPair(),
				botSettings: this.botSettings,
				botID: this.botID,
				user: user,
				state: this.state,
				status: this.status
			},
				newProcess = new Process(resObj);

			this.processes[newProcess._id] = newProcess;
			await this.updateBot(user);
			this.processes[newProcess._id]
				.startTrade(user)
				.catch(err => console.log(err));
		// }
		// else {
		// 	this.status = CONSTANTS.BOT_STATUS.INACTIVE;
		// }
	}

	async startAuto(user = this.user, message = '') {
		console.log('startAuto');
		
		if(!message) await this.pushTradingSignals();

		while(this.status === CONSTANTS.BOT_STATUS.ACTIVE) {
			console.log('FIIINDE PAAAAIRS');
			let signal = await this.checkSignals(user);
			
			if(signal) {
				console.log('найдены подходящие условия для пары - ' + signal.symbol);
				await this.updateBot(user);
			
				this.pair.from = this.findFromSymbol(signal.symbol);

				if(this.pair.from) {
					this.botSettings.decimalQty = await Symbols.getLotSize(this.getPair());
					let resObj = {
							symbol: this.getPair(),
							botSettings: this.botSettings,
							botID: this.botID,
							user: user,
							state: this.state,
							status: this.status
						},
						newProcess = new Process(resObj);
					
					this.processes[newProcess._id] = newProcess;
					await this.updateBot(user);

					this.processes[newProcess._id]
						.startTrade(user)
						.catch(err => console.log(err));

					this.pair.from = '';
				}

				sleep(CONSTANTS.AUTO_BOT_SLEEP);
			}
		}

		await this.clearTradingSignals();
		// await this.disableBot('выключили во время поиска пар');
		this.disableBot(user);
		await this.updateBot(user);
	}
	//:: START FUNC END

	//************************************************************************************************//
	
	//:: SET FUNC
	setClient(user) {
		let key = '',
			secret = '',
			ret = true;

		if(user.binanceAPI.name !== '') {
			try {
				key = Crypto.decipher(user.binanceAPI.key,  Crypto.getKey(user.regDate, user.name))
				secret = Crypto.decipher(user.binanceAPI.secret,  Crypto.getKey(user.regDate, user.name))
			}
			catch(err) {
				console.log('ошибка с определением ключей бинанса');
				key = '';
				secret = '';
				ret = false;
			}
			this.Client = binanceAPI({
				apiKey: key,
				apiSecret: secret
			})
		}
		else {
			ret = false;
		}
		return ret
	}
	//:: SET FUNC END
	
	//************************************************************************************************//
	
	//:: GET FUNC 
	getPair(from = this.pair.from) {
		return from + this.pair.to
	}

	findFromSymbol(symbol = '') {
		let ret = false;
		this.pair.requested.forEach(elem => {
			if(symbol.indexOf(elem) >= 0) ret = elem;
		})
		return ret
	}
	//:: GET FUNC END
	
	//************************************************************************************************//
	
	//:: CHECK FUNC
	isManual() {
		return this.state === CONSTANTS.BOT_STATE.MANUAL;
	}

	isAuto() {
		return this.state === CONSTANTS.BOT_STATE.AUTO;
	}

	checkForActivate(nextStatus) {
		let bot_status = CONSTANTS.BOT_STATUS,
			processesStatus = false;

		for (let processId in this.processes) {
			let proc = this.processes[processId];
			if(proc.status === bot_status.ACTIVE || proc.runningProcess) {
				processesStatus = true;
				break;
			}
		}
		
		return (this.status === bot_status.INACTIVE && nextStatus === bot_status.ACTIVE && !processesStatus);
	}
	
	checkForDeactivate(nextStatus) {
		let bot_status = CONSTANTS.BOT_STATUS
		return (this.status === bot_status.ACTIVE && nextStatus === bot_status.INACTIVE);
	}

	isUnusedSignal(signal) {
		let ret = true;

		for (let _id in this.processes) {
			if(this.processes[_id].symbol === signal.symbol) {
				ret = false;
				break;
			}
		}
		
		return ret;
	}

	isEqualSignals(signal) {
		return signal.checkRating === signal.rating || (signal.checkRating === CONSTANTS.TRANSACTION_TERMS.BUY && signal.rating === CONSTANTS.TRANSACTION_TERMS.STRONG_BUY);
	}

	isCurrentSignal(signal) {
		let ret = false,
			ind = this.botSettings.curTradingSignals.findIndex(elem => elem.id === signal.id);

		if(ind !== -1) {
			this.botSettings.curTradingSignals[ind].rating = signal.rating;
			ret = true;
		}
		return ret;
	}

	async checkSignals(user = this.user) {
		let ret = {
				flag: false,
				signal: {}
			};
		
		while(!ret.flag && this.status !== CONSTANTS.BOT_STATUS.INACTIVE) {
			await sleep(CONSTANTS.ORDER_TIMEOUT);
			// await this.updateBot(user);
			await this.updateSignals(user);
			let signals = await Mongo.syncSelect({}, CONSTANTS.TRADING_SIGNALS_COLLECTION);
			console.log('lol');
			signals.forEach(signal => {
				this.isCurrentSignal(signal);
			});
			// await this.updateBot(user);
			await this.updateSignals(user);
			for(let i = 0; i < this.botSettings.curTradingSignals.length; i++) {
				let signal = this.botSettings.curTradingSignals[i];
				if(this.isEqualSignals(signal) && this.isUnusedSignal(signal)) {
					ret = {
						flag: true,
						signal: signal
					};
					break;
				}
			}
		}
		return ret.signal;
	}
	//:: CHECK FUNC END

	//************************************************************************************************//
	
	//:: UPDATE FUNC
	async updateSignals(user = this.user) {
		console.log('[ upd signals');
		user = { name: user.name };

		let data = await Mongo.syncSelect(user, 'users');
		data = data[0];

		const index = data.bots.findIndex(bot => bot.botID === this.botID);
		
		const change = `bots.${index}.botSettings.curTradingSignals`,
			changeObj = {};
		
		changeObj[change] = this.botSettings.curTradingSignals;
		await Mongo.syncUpdate(user, changeObj, 'users');
		console.log('] upd signals');
	}

	async updateBot(user = this.user, message = '') {
		console.log('[ sync upd ');
		user = { name: user.name };
		// await this.syncUpdateUserOrdersList(user);
		let data = await Mongo.syncSelect(user, 'users');
		data = data[0];
		let tempBot = new Bot(this);

		const index = data.bots.findIndex(bot => bot.botID === tempBot.botID);
		
		const change = `bots.${index}`,
			changeObj = {};
		
		changeObj[change] = tempBot;

		await Mongo.syncUpdate(user, changeObj, 'users');
		console.log('] sync upd ');
	}
	//:: UPDATE FUNC END
	
	//************************************************************************************************//

	async pushTradingSignals() {
		console.log('---- pushTradingSignals');
		let signals = this.botSettings.tradingSignals,
			l = signals.length,
			pairs = this.pair.requested,
			pairsL = pairs.length,
			newTrSs = [];
		
		for(let j = 0; j < pairsL; j++) {
			let pair = pairs[j];
			for(let i = 0; i < l; i++) {
				signals[i].symbol = this.getPair(pair);
				// let id = md5(Math.random()*(new Date).getMilliseconds()*2/1213545/Math.random() + signals[i].symbol + (i*j*Math.pow(i, j*Math.random())))
				let id = uniqid();
				let signal = new TradingSignals(signals[i], id);
				newTrSs.push(signal);
				await Mongo.syncInsert(signal, CONSTANTS.TRADING_SIGNALS_COLLECTION);
			}
		}

		this.botSettings.curTradingSignals = newTrSs;
	}

	async clearTradingSignals() {
		console.log('[ clearTradingSignals');
		let signals = this.botSettings.curTradingSignals,
			l = signals.length;

		for(let i = 0; i < l; i++) {
			let signal = signals[i]	;
			console.log(`clear ${i+1} signal (${signal.id})`);
			await Mongo.syncDelete({ id: signal.id }, CONSTANTS.TRADING_SIGNALS_COLLECTION);
		}
		this.botSettings.curTradingSignals = [];
		this.pair.from = '';
		console.log('] clearTradingSignals');
	}

	disableBot(user = this.user) {
		for (let _id in this.processes) {
			this.processes[_id].deactivateProcess();
		}
		this.status = CONSTANTS.BOT_STATUS.INACTIVE;
	}

	cancelAllOrders(user = this.user, processId = 0) {
		return new Promise( async (resolve, reject) => {
			try {
				if(processId && this.processes[processId]) {
					let res = await this.processes[processId].cancelAllOrders(user);
					if(res.status !== 'error') {
						await this.processId[processId].disableProcess('Все распродано по рынку, бот выключен');
					}
					// for (let _id in this.processes) {
					// 	await this.processes[_id].cancelAllOrders(user);
					// 	await this.processes[_id].disableProcess('Все распродано по рынку, бот выключен');
					// }
					resolve(res);
				} else {
					reject({
						status: 'error',
						message: 'Неверный идентификатор'
					});
				}
			}
			catch(err) {
				reject({
					status: 'error',
					message: `eeeror ${err}`
				});
			}
		});
	}

	async cancelOrder(orderId = 0, processId = '') {
		orderId = Number(orderId);
		if(orderId && processId && this.processes[processId]) {
			let res = await this.processes[processId].cancelOrder(orderId);
			return res;
		} else {
			return {
				status: 'error',
				message: 'Неверно отправленны данные ордера и процесса.',
				data: { orderId: orderId,
						processId: processId
					}
			}
		}


		// try {
		// 	let pair = this.getPair()
		// 	let order = await this.getOrder(orderId),
		// 		side = order.side,
		// 		qty = order.origQty,
		// 		status = '',
		// 		message = ''
		// 	try {
		// 		var cancelOrder = await this.Client.cancelOrder({
		// 			symbol: pair,
		// 			orderId: orderId
		// 		})
		// 		if(this.isOrderSell(side)) {
		// 			this.recountQuantity(qty)
		// 		}
		// 		status = 'ok'
		// 		message = `ордер ${cancelOrder.orderId} завершен`
		// 	}
		// 	catch(error) {
		// 		status = 'error'
		// 		message = `ошибка при завершении ордера ${cancelOrder.orderId}`
		// 	}
		// 	this._log('закрытие ордера - ' + message)
		// 	return {
		// 		status: status,
		// 		message: message,
		// 		data: { order: cancelOrder }
		// 	}
		// }
		// catch(error) {
		// 	this._log('закрытие ордера - ' + error)
		// 	return {
		// 		status: 'error',
		// 		message: error,
		// 		data: { orderId: orderId }
		// 	}
		// }
	}

	async deleteBot(user = this.uesr) {
		return new Promise( async (resolve, reject) => {
			try {
				this.disableBot(user);
				await this.cancelAllOrders(user);
				resolve({ status: 'ok' });
			}
			catch(err) {
				reject({ 
					status: 'error',
					message: err 
				});
			}
		});
	}
}