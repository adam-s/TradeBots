const Mongo = require('./Mongo');
const CONSTANTS = require('../constants');
const Bitaps = require('./Bitaps');
const M = require('./Message');
const uniqid = require('uniqid');

class Balance {

	async getUserWalletInfo(user = {}, callback = (data = {}) => {}) {
		if(user.name) {
			user = { name: user.name };
	
			let user = await Mongo.syncSelect(user, CONSTANTS.USERS_COLLECTION);
			if(user.length) {
				user = user[0];

				let walletInfo = {
					walletBalance: user.walletBalance,
					walletAddress: user.walletAddress
				}
				callback(M.getSuccessfullyMessage({ data: walletInfo }));
			} else callback(M.getFailureMessage({ message: 'Пользователь не найден!' }));
		} else callback(M.getFailureMessage({ message: 'Пользователь не найден!' }));
	}

	async createWallet(user = {}, callback = (data = {}) => {}) {
		user = { userId: user.userId };

		let paymentWallet = await Bitaps.createWallet(user);
		if(paymentWallet) {
			callback(paymentWallet.address);
			return paymentWallet.address;
		}
		callback(false);
		return false;
	}

	async topUpBalance(user = {}, 	) {

	}

	// purch
}

module.exports = new Balance();