var mongoose = require ("mongoose");

exports.ForexHistory = mongoose.model('ForexHistory',new mongoose.Schema({
	asset: String,
	bid: Number,
	timestamp:  Number

},{ autoIndex: false }));


exports.phoneValidate = mongoose.model('phone_validation',new mongoose.Schema({
	number: String,
	code:  String,
	ip: String,
	timestamp: Number

},{ autoIndex: false }));