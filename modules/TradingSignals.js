const TIMEFRAME = require('../constants').TIMEFRAME;
const TRANSACTION_TERMS = require('../constants').TRANSACTION_TERMS;
module.exports = class TraidingSignals {
	constructor({
		timeframe = TIMEFRAME.M1,
		checkRating = TRANSACTION_TERMS.BUY,
		rating = '',
		id = Date.now()
	}, symbol = '') {
		this.symbol = symbol
		this.rating = rating
		this.checkRating = checkRating
		this.timeframe = timeframe
		this.id = id
	}
}