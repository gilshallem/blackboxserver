var IP_KEEP_MINUTES = 60;
var models = require ("./models");

exports.registerUser = function(ip,refCategory,ref,shouldOveride,callback,err) {
	findUser(ip,function(user) {
		if (user==null) {
			//create user
			var newUser  =new models.tracker({
				ip: ip,
				refferal_category: refCategory,
				refferal: ref,
				timestamp: new Date().getTime()
			});
			newUser.save(function(dbErr) {
				if (dbErr) {
					err();
				}
				else {
					callback()
				}
			});
		}
		else {
			// update user
			if (shouldOveride && (user.refferal_category != refCategory || ref!=user.refferal)) {
				user.refferal_category = refCategory;
				user.refferal = ref;
			}
			user.timestamp = new Date().getTime();
			user.save(function(dbErr) {
				if (dbErr) {
					err();
				}
				else {
					callback()
				}
			});
		}
	},err);
};

exports.getRef = function(ip,callback,err) {
	findUser(ip,function(user) {
		if (user) {
			callback(user.refferal,user.refferal_category);
		} else {
			callback(null);
		}
	},err);
};

exports.getTrackerId = function (req,res) {
	if (!req.cookies || !req.cookies._tracker) {
	      req.cookies._tracker = generateUserToken();
	      res.cookie('_tracker', req.cookies._tracker, { 
	    	  expires : false
	        , httpOnly : true 
	      });
	}
	return req.cookies._tracker;
}
function generateUserToken () {
    var md5sum = crypto.createHash('md5');
    var val = String(Math.random());
    md5sum.update(val);
    return md5sum.digest('hex');
  }
function findUser(ip,callback,errorCallback) {
	var now = new Date().getTime();
	models.tracker.findOne({
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