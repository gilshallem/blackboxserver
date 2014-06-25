var MIN_DAYS_BETWEEN_SHARES = 3;
var models = require ("../models");
// will return the amount of days before the user can share. -1 for error
exports.canShare = function(network,shareId,action,callback) {

	models.shares.find({network:network, id: shareId,action:action}
	, function(err, shares)  { 
		if(err) {
			callback(-1);
		}
		else {
			if (shares) {
				var lastTime=0;
				for (var i = 0; i < shares.length; i++) {
					lastTime = Math.max(lastTime,shares[i].time);
				}
				var timeFromLastShare = new Date().getTime() - lastTime;
				var minTimeBtweenShares = MIN_DAYS_BETWEEN_SHARES*8640000;
				if (timeFromLastShare>minTimeBtweenShares) {
					callback(0);
				}
				else {
					callback(minTimeBtweenShares-timeFromLastShare);
				}
			}
			else {
				// did not share yet
				callback(0);
			}

		}
	});
};

exports.onShared = function(network,shareId,action,callback) {
	models.shares.create({network:network,id:shareId,action:action,time:new Date().getTime()},function(err) {
		if (err) {
			callback(1);
		}
		else {
			callback(0);
		}
	});
};

