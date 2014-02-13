var models = require ("../models");

exports.calculate = function(period,name,resultFunction) {
	var begining = new Date().getTime() - (period*60000);
	var values;
	models.ForexHistory.aggregate([ 
	                             { $match: {timestamp : {$gte: begining }} },
	                             { $group: {
	                            	 _id: '$asset',
	                            	 val: { $avg: '$bid'}
	                             }}
	                             ], 
	                         	function (err, results) {
									if (err) {
										console.error(err);
										resultFunction(name,null);
									} else {
										resultFunction(name,results);
									}
								}
	);
	
}
