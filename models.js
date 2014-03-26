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
	timestamp: Number
},{ autoIndex: false }));

exports.tracker = mongoose.model('tracker',new mongoose.Schema({
	ip: String,
	refferal_category: String,
	refferal: String,
	timestamp: Number

},{ autoIndex: false }));