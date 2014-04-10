var SUCCESS					= 0;
var ERROR_SERVER 			= 1;
var ERROR_NO_CUPON 			= 2;
var ERROR_CUPON_EXPIRED 	= 3;
var ERROR_CUPON_TAKEN	 	= 4;
var ERROR_CUPON_USED 		= 5;

var models = require ("../models");


exports.createCupon = function(expiry,duration,callback) {
	var code = randomString(10);
	var newCupon  =new models.cupons({
		code: code,
		expiryTime: expiry,
		durationDays: duration
	});
	newCupon.save(function(dbErr) {
		callback(code,dbErr)
	});
};


exports.useCupon = function(account,number,code,callback) {
	models.cupons.findOne({ code: code }
	, function(err, cupon)  { 
		if(err) {
			callback(ERROR_SERVER);
		}
		else {
			if (cupon) {
				var now = new Date().getTime();
				if (cupon.activationTime!=null) {
					if (cupon.account!=null && cupon.account!=account) {
						callback(ERROR_CUPON_TAKEN);
					}
					else {
						if ((cupon.activationTime + (cupon.durationDays*86400000)) < now) {
							callback(ERROR_CUPON_USED);
						}
						else {
							callback(SUCCESS);
						}
					}
				}
				else {
					if (cupon.expiryTime>now) {
						cupon.activationTime = new Date().getTime();
						cupon.account = account;
						cupon.number = number;
						cupon.save();
						callback(SUCCESS);
					}
					else {
						callback(ERROR_CUPON_EXPIRED);
					}
				}
			}
			else {
				callback(ERROR_NO_CUPON);
			}

		}
	});
};


//TODO: finish
exports.deleteUnusedCupons = function() {
	var now = new Date().getTime();
	var before = now - (60 * 86400000);
	models.cupons.find({ timestamp:{$lt: before} }, function(err,cupons) {
		if (!err) {
			console.log("Old cupons removed");
			
		}
		else {
			console.log("Error removing cupons: "+ err.message);
		}
	});
};

function randomString(len, charSet) {
    charSet = charSet || 'abcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}