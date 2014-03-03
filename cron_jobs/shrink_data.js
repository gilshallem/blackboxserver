var MAX_FOREX_HISTORY_MINUTES 				= 90;
var MAX_PHONE_VALIDATION_HISTORY_MINUTES 	= 30;


var models = require ("../models");
var cronJob = require('cron').CronJob;


exports.start = function() {
	var job = new cronJob({
		cronTime: '*/10 * * * *',
		onTick: function() {
			console.log("shrinking db");
			shrinkForexData();
			shrinkPhoneValidation();
		},
		start: true

	});
	job.start();

}


function shrinkForexData() {
	var now = new Date().getTime();
	var before = now - (MAX_FOREX_HISTORY_MINUTES * 60000);
	models.ForexHistory.remove({ timestamp:{$lt: before} }, function(err) {
		if (!err) {
			console.log("Old data removed");
			
		}
		else {
			console.log("Error removing data: "+ err.message);
		}
	});
}

function shrinkPhoneValidation() {
	var now = new Date().getTime();
	var before = now - (MAX_PHONE_VALIDATION_HISTORY_MINUTES * 60000);
	models.phoneValidate.remove({ timestamp:{$lt: before} }, function(err) {
		if (!err) {
			console.log("Old data removed");
			
		}
		else {
			console.log("Error removing data: "+ err.message);
		}
	});
}

