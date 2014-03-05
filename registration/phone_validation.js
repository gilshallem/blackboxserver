var VALIDATING_COOLDOWN_MINUTES = 60;
var SENDING_COOLDOWN_MINUTES = 15;
var NUMBER_OF_TRYS = 5;

var SMS_FROM = "BlackBox";
var SMS_TEXT = "Welcome to ForexBlackBox. Your SMS code is: ";
var CODE_LENGTH = 4;

var SUCCESS = 0;
var INVALIDE_CODE = -3;
var ERROR_SERVER = -1;
var ERROR_TO_MANY_TRYES = -2;

var models = require ("../models");
var nexmo = require("../external_apis/nexmo");




exports.validatePhone = function(number,code,callback) {
	var now = new Date().getTime();
	models.phoneValidate.findOne({
		$and: [
		       { number: number },
		       { code: code },
		       {timestamp:{$gt: now - (VALIDATING_COOLDOWN_MINUTES*60000)}  }
		       ]}
	, function(err, phoneRow)  { 
		if(err) {
			callback(ERROR_SERVER,err);
		}
		else {
			if (phoneRow) {
				callback(SUCCESS);
			}
			else {
				callback(INVALIDE_CODE);
			}

		}
	});
};

exports.sendSMS = function(number,ip,callback) {
	var code =generateRandomCode();
	var now = new Date().getTime();
	models.phoneValidate.count({
		$and: [
		       { timestamp:{$gt: now - (SENDING_COOLDOWN_MINUTES*60000)} },
		       { $or: [{number: number}, {ip:ip}] }
		       ]}
	, function(err, c)
	{
		if (err) {
			callback(ERROR_SERVER,err);
		}
		else {
			if (number.indexOf("526605556") != -1 &&  c>=NUMBER_OF_TRYS) {
				callback(ERROR_TO_MANY_TRYES);
			}
			else {
				nexmo.sendSMS(SMS_FROM,number,SMS_TEXT + code,function (status,err) {
					if (status==0) {
						models.phoneValidate.create({number:number,code:code,ip:ip,timestamp:now},function(err) {
							if (err) {
								callback(ERROR_SERVER,err);
							}
							else {
								callback(0);
							}

						});
					}
					else {
						callback(status,err);
					}
				});
				
			}
		}
	});


};

function generateRandomCode() {
	var code="";
	for (var i=0;i<CODE_LENGTH;i++) {
		code+=getRandom(0,9);
	}
	return code;
}

function getRandom(min,max) {
	return Math.floor(Math.random()*(max-min+1))+min;
}
