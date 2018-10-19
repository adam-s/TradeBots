const binanceAPI = require('node-binance-api');
const Crypto = require('../modules/Crypto');
const User = require('./Users');
const Mongo = require('./Mongo');
const uniqid = require('uniqid');
const BK = require('../constants').BK;

module.exports = class Binance {
	constructor({
		name = 'untiteled',
		// keyId = uniqid(BK),
		key = null,
		secret = null,
		data = null
	}) {
		this.name = name;
		// this.keyId = keyId;
		this.key = Crypto.cipher(key, Crypto.getKey(data.regDate, data.name));
		this.secret = Crypto.cipher(secret, Crypto.getKey(data.regDate, data.name));
		// this.options = binanceAPI().options({
		// 	APIKEY: String(key),
		// 	APISECRET: String(secret),
		// 	useServerTime: true, 
 		// 	test: true
		// });
	}
}