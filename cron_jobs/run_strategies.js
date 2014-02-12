var cronJob = require('cron').CronJob;

exports.start = function(strategies) {
	for (strategyName in strategies) {
		var strategy = strategies[strategyName];
		var cronFunction = function() {
			var job = new cronJob(
					getNextTime(strategy.interval_min,strategy.interval_max), 
						function(){
							// models.Strategies.update({StrategyId:1}, {bidPower:getRandom(-10,10)}, {upsert: true}, function (err) {});
							strategy.run();
							cronFunction();
						}, 
					function () {},
			  true
			);
			
			job.start();
		};// run function
		strategy.run();
		cronFunction();
	}
}

function getRandom(min,max) {
	return Math.floor(Math.random()*(max-min+1))+min;
}

function getNextTime(min,max) {
	var now = new Date();
	now.setSeconds(now.getSeconds() + getRandom(min,max));
	return now;
}
