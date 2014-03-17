var IP_KEEP_MINUTES = 30;
var models = require ("./models");

exports.registerUser = function(ip,isPixel,overidePixel,overrideLink,refCategory,ref,callback,err) {
	
};

exports.getRef = function(ip,callback,err) {
	findUser(ip,function(user) {
		if (user) {
			callback(user.referal,user.referal_category);
		} else {
			callback(null);
		}
	},err);
};

function findUser(ip,callback,errorCallback) {
	var now = new Date().getTime();
	models.tracker.findOne(
		$and: [
		       { ip: ip },
		       {timestamp:{$gt: now - (IP_KEEP_MINUTES*60000)}  }
		       ]}
	, function(err, user)  { 
		if(err) {
			if (!errorCallback) errorCallback();
		}
		else {
			if (user) {
				callback(user);
			}
			else {
				callback();
			}

		}
	});
}