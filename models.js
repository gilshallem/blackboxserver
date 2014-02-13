var mongoose = require ("mongoose");

exports.ForexHistory = mongoose.model('ForexHistory',new mongoose.Schema({
	asset: String,
	bid: Number,
	timestamp:  Number

},{ autoIndex: false }));

exports.indicators = mongoose.model('indicators',new mongoose.Schema({
	asset: String,
	timestamp:  Number,
	ma10: Number

},{ autoIndex: false }));