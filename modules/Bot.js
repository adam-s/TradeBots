let BotSettings = require('./BotSettings');
let Order = require('./Order');
const Crypto = require('../modules/Crypto');
let binanceAPI = require('binance-api-node').default;
const WSS = require('./WSS');

const CONSTANTS = require('../constants');

module.exports = class Bot {
	constructor({
		title = 'Untitled bot',
		state = CONSTANTS.BOT_STATE.MANUAL,
		status = CONSTANTS.BOT_STATUS.INACTIVE,
		botFreeze = CONSTANTS.BOT_FREEZE_STATUS.INACTIVE,
		botID = String(Date.now()),
		pair = '',
		currentOrder = null,
		orders = [],
		botSettings = {}
	}) {
		this.title = title;
		this.state = state;
		this.status = status;
		this.botFreeze = botFreeze;
		this.pair = pair;//new Pair(pair.from, pair.to);
		this.orders = orders;
		this.currentOrder = currentOrder;
		this.botSettings = new BotSettings(botSettings);
		this.botID = botID;
	}

	async changeStatus(nextStatus, userID, user) {
		this.status = nextStatus;
		if(this.status === CONSTANTS.BOT_STATUS.ACTIVE) {
			console.log('АКТИВ')
			if(this.state === CONSTANTS.BOT_STATE.MANUAL) {
				this.startManual(userID, user)
			}
			else if(this.state === CONSTANTS.BOT_STATE.AUTO) {
				this.startAuto(userID, user)
			}
			else {
				console.log('ЧТО-ТО ПОШЛО НЕ ТАК, ВЫКЛ')
				this.status = CONSTANTS.BOT_STATUS.INACTIVE
			}
		}
		else if(this.status === CONSTANTS.BOT_STATUS.INACTIVE) {
			console.log('ИНАКТИВ')
			this.currentOrder = null
		}
		else {
			console.log('ЧТО-ТО НЕ ТО, ВЫКЛЮЧЕНИЕ')
			this.status = CONSTANTS.BOT_STATUS.INACTIVE
		}
	}

	startManual(userID, user) {
		console.log('startManual')
		let key = Crypto.decipher(user.binanceAPI.key,  Crypto.getKey(user.regDate, user.name))
		let secret = Crypto.decipher(user.binanceAPI.secret,  Crypto.getKey(user.regDate, user.name))
		this.Client = binanceAPI({
			apiKey: key,
			apiSecret: secret
		})
		WSS.users[userID].send('хер ' + userID)
		this.currentOrder = {}
		this.startTrade()
		.catch((err) => console.log(err))
		
	}

	startAuto(userUD, user) {
		console.log('startAuto')
	}

	async startTrade() {
		console.log('startTrade')
		//TODO 
		//1. создание ордера по начальным параметрам
		//2. создание страховочных ордеров
		//3. выставить ордер на продажу так, чтобы выйти в профит по takeProffit
		//4. запуск цикла проверки статуса цены валюты 
		//5. проверка и описание решений исходов
		//end

		//1. создание ордера по начальным параметрам
		let price = await this.Client.allBookTickers()
		price = Number(price[this.pair].bidPrice)
		let quantity = Math.ceil((Number(this.botSettings.initialOrder) / price)*100) /100
		let newOrderParams = {
			symbol: this.pair,
			quantity: quantity,
			side: 'BUY',
			price: price
		}
		console.log('-----')
		console.log(newOrderParams)
		let newBuyOrder = await this.Client.orderTest(newOrderParams)
		console.log(newBuyOrder)

		//2. создание страховочных ордеров
		let deviation = Number(this.botSettings.deviation) / 100,
			amout = Number(this.botSettings.safeOrder.amount),
			currentPrice = price,
			safeOrders = [],
			decimal = String(price).length - 2
		for(let i = 0; i < amout; i++) {
			currentPrice -=  currentPrice * deviation
			currentPrice = Number(currentPrice.toFixed(decimal))
			let orderParams = {
				symbol: this.pair,
				quantity: quantity,
				side: 'BUY',
				price: currentPrice
			}
			console.log('---')
			console.log(orderParams)
			let newOrder = await this.Client.orderTest(orderParams)
			console.log(newOrder)
			safeOrders.push(orderParams)
		}
		/*
			тут нужно добавить создание new Order и запихнть в базу данных массив safeOrders
		*/

		//3. выставить ордер на продажу так, чтобы выйти в профит по takeProffit

		// Изменить на создание ордера с полем type = TAKE_PROFIT
		let takeProffit = (Number(this.botSettings.takeProffit) + CONSTANTS.BINANCE_FEE) / 100,
			proffitPrice = Number((price + price * takeProffit).toFixed(decimal)),
			orderParams = {
				symbol: this.pair,
				quantity: quantity,
				side: 'SELL',
				price: proffitPrice,
				type: 'TAKE_PROFIT_LIMIT',
				stopPrice: proffitPrice
			}
		console.log('---')
		console.log(orderParams)
		let newSellOrder = await this.Client.orderTest(orderParams)
		console.log(newSellOrder)


		//4. запуск цикла проверки статуса цены валюты 
		// Сделать интервал, сохранить его куда нибудь для возможности выключения
		// значит, далее нужно .. хм.. чекать статусы ордера на продажу и страховочных
		// если 1 - ордер на продажу завершен - закрыть все страховочные ордера и начать все сначала
		// если 2 - ордер на продажу не завершен и сработал один из страховочных:
		// пересчитать quantity, так как была еще куплена валюта
		// пересчитать еще ченить 
		// пересоздать takeProfit ордер и начать продолжить слежку
		

		/*!!! при любых изменениях сохранять в бд и отсылать юзеру измененную инфу !!!*/
	}
}