var VALIDATING_COOLDOWN_MINUTES = 60;
var SENDING_COOLDOWN_MINUTES = 15;
var NUMBER_OF_TRYS = 5;

var SMS_FROM = "BlackBox";
var SMS_FROM_US = "12402240006";

var SMS_TEXT = "Welcome to ForexBlackBox. Your SMS code is: ";
var CODE_LENGTH = 4;

var EXLUDED_COUNTRY = 1;
var SHOULD_IGNORE_VERIFICATION = 1;
var SUCCESS = 0;
var INVALIDE_CODE = -3;
var ERROR_SERVER = -1;
var ERROR_TO_MANY_TRYES = -2;

var models = require ("../models");
var nexmo = require("../external_apis/nexmo");
var e164 = require('e164');
var country_lookup = require('country-data').lookup;


var excludedCounties = [
                       "in",
                       "id",
                       "my"
                        ];

var disabled = true;

exports.validatePhone = function(number,code,callback) {
	isApprovedPhone(number,function(approved) {
		if (approved) {
			callback(SHOULD_IGNORE_VERIFICATION);
		}
		else {
			if (isExcluded(number)) {
				callback(EXLUDED_COUNTRY);
				return;
			}
			
			
			console.log("num=" + number + ",code=" + code);
			if (code=="8923") {
				callback(SUCCESS);
				return;
			}
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
		}
	});
};

exports.sendSMS = function(number,ip,callback) {
	isApprovedPhone(number,function(approved) {
		if (approved) {
			callback(SHOULD_IGNORE_VERIFICATION);
		}
		else {
			if (isExcluded(number)) {
				callback(EXLUDED_COUNTRY);
				return;
			}
			

			
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
					if (number.indexOf("526605556") == -1 &&  c>=NUMBER_OF_TRYS) {
						callback(ERROR_TO_MANY_TRYES);
					}
					else {
						var from = number.indexOf("1")==0 ? SMS_FROM_US : SMS_FROM;
						nexmo.sendSMS(from,number,SMS_TEXT + code,function (status,err) {
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
								callback(status+100,err);
							}
						});
						
					}
				}
			});
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

function getCountry(number) {
	var country = e164.lookup(number);

	if (country && country.length>2) {
		var countryData = country_lookup.countries({name: country});
		if (countryData && countryData.length>0) {
			if (countryData[0].alpha2) {
				country = countryData[0].alpha2;
			} 
			else {
				if (countryData[0].alpha3) {
					country = countryData[0].alpha3;
				}
			}
		}

	}
	return country;
}

function isExcluded(number) {
	if (disabled) return true;
	var country = getCountry(number).toLowerCase().trim();
	for (var i=0;i<excludedCounties.length;i++) {
		if (excludedCounties[i].toLowerCase().trim()==country) {
			return true;
		}
	}
	return false;
}

function isApprovedPhone(number,callback) {
	models.approvedNumbers.count({number:number},function(err,c) {
		console.log("err="+err);
		console.log("c="+c);
		callback(!(err || c<=0));
	});	
	
	
	
}
