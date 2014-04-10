var MIN_DAYS_BETWEEN_SHARES = 3;
var models = require ("../models");
// will return the amount of days before the user can share. -1 for error
exports.canShare = function(shareId,callback) {

	models.shares.findOne({ id: shareId}
	, function(err, share)  { 
		if(err) {
			callback(-1);
		}
		else {
			if (share) {
				var timeFromLastShare = new Date().getTime() - share.time;
				var minTimeBtweenShares = MIN_DAYS_BETWEEN_SHARES*86400000;
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

exports.onShared = function(shareId,callback) {
	models.shares.create({id:shareId,time:new Date().getTime()},function(err) {
		if (err) {
			callback(1);
		}
		else {
			callback(0);
		}
	});
};

