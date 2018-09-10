const CONSTANTS = {
	TIMEFRAME: {
		m1: '1m',
		m5: '5m',
		m15: '15m',
		h1: '1h',
		h4: '4h',
		d1: '1d',
		w1: '1w',
		M1: '1M'
	},

	TRANSACTION_TERMS: {
		BUY: 'Buy',
		STRONG_BUY: 'Strong Buy',
		SELL: 'Sell',
		STRONG_SELL: 'Strong Sell',
		NEUTRAL: 'Neutral'
	},

	VOLUME_LIMIT: {
		BTC: { NAME: 'BTC', VALUE: 0.001 },
		ETH: { NAME: 'ETH', VALUE: 0.01 },
		BNB: { NAME: 'BNB', VALUE: 1 },
		USDT: { NAME: 'USDT', VALUE: 10 }
	},

	// PAIRS: {
	// 	ETHBTC: 'ETHBTC',
	// 	BNBBTC: 'BNBBTC',
	// 	BNBETH: 'BNBETH',
	// 	BTCUSDT: 'BTCUSDT',
	// 	ETHUSDT: 'ETHUSDT',
	// 	BNBUSDT: 'BNBUSDT'
	// },

	PAIRS: [
		'ETHBTC',
		'BNBBTC',
		'BNBETH',
		'BTCUSDT',
		'ETHUSDT',
		'BNBUSDT'
	],

	BOT_STATE: {
		AUTO: '0',
		MANUAL: '1'
	},

	BOT_STATUS: {
		INACTIVE: false,//'0',
		ACTIVE: true//'1'
	},

	BOT_FREEZE_STATUS: {
		INACTIVE: '0',
		ACTIVE: '1'
	},

	ORDER_STATE: {
		OPENED: 0,
		PROCESSED: 1,
		COMPLETED: 2,
		FAILED: 3
	},

	BINANCE_FEE: 0.1,

	ORDER_STATUS: {
		NEW: 'NEW',
		PARTIALLY_FILLED: 'PARTIALLY_FILLED',
		FILLED: 'FILLED',
		CANCELED: 'CANCELED',
		PENDING_CANCEL: 'PENDING_CANCEL',
		REJECTED: 'REJECTED',
		EXPIRED: 'EXPIRED'
	},

	ORDER_SIDE: {
		BUY: 'BUY',
		SELL: 'SELL'
	},

	ORDER_TYPE: {
		LIMIT: 'LIMIT', 
		MARKET: 'MARKET'
	},

	TIMEOUT: 500,

	ORDER_TIMEOUT: 1000,

	TRADING_SIGNALS_COLLECTION: 'tradingSignals'
}
module.exports = CONSTANTS