var mongoose = require ("mongoose");

exports.ForexHistory = mongoose.model('ForexHistory',new mongoose.Schema({
	asset: String,
	bid: Number,
	timestamp:  Number

},{ autoIndex: false }));

/*
exports.CurrencyPairs = mongoose.model('CurrencyPairs',new mongoose.Schema({
	asset: String,
	bid: Number,
	offer: Number,
	timestamp:  Date
},{ autoIndex: false }));*/
//models.CurrencyPairs.index({ bid: 1, timestamp: -1 });

exports.quotes = mongoose.model('ForexQuotes',new mongoose.Schema({
	asset: { type: String, index: true},
	open: Number,
	close: Number,
	high: Number,
	low: Number,
	interval: { type: Number, index: true},
	timestamp:  { type: Date, index: true},
	firstBid: Number
},{ autoIndex: false }));


exports.phoneValidate = mongoose.model('phone_validation',new mongoose.Schema({
	number: String,
	code:  String,
	ip: String,
	timestamp: Number

},{ autoIndex: false }));

exports.leads = mongoose.model('leads',new mongoose.Schema({
	firstName: String,
	lastName:  String,
	email:  String,
	country:  String,
	phone:  String,
	language:  String,
	refCat:  String,
	ref:  String,
	sentToCRM: Boolean,
	sentToCRM2: Boolean,
	timestamp: Number
},{ autoIndex: false }));

exports.cupons = mongoose.model('cupons',new mongoose.Schema({
	code: String,
	number: String,
	account: String, 
	expiryTime: Number,
	activationTime: Number,
	durationDays: Number,
},{ autoIndex: false }));

exports.shares = mongoose.model('shares',new mongoose.Schema({
	id: String,
	network: String,
	action: String,
	time: Number
},{ autoIndex: false }));

exports.tracker = mongoose.model('tracker',new mongoose.Schema({
	ip: String,
	refferal_category: String,
	refferal: String,
	timestamp: Number

},{ autoIndex: false }));