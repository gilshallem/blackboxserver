var statisticsConfig = [
	{
		start:500,
		min:200,
		max:800,
		maxAddition:5,
		minAddition:-5,
		interval:30*60000
	},
	{
		start:2.5,
		min:1.2,
		max:4,
		maxAddition:0.1,
		minAddition:-0.1,
		interval:30*60000
	},
	{
		start:20,
		min:15,
		max:26,
		maxAddition:1,
		minAddition:-1,
		interval:2*60000
	}
];

var values=[1,2];


exports.start = function() {
	for (i = 0; i < statisticsConfig.length; ++i) {
	    values[i] = statisticsConfig[i].start;
	    startUpdating(i);
	   /* setInterval(function() {
	    	 console.log("updating stats " + conf.start);
	    	var i=0;
	    	values[i]=Math.min(Math.max(values[i]+getRandom(statisticsConfig[i].minAddition,statisticsConfig[i].maxAddition),statisticsConfig[i].min),statisticsConfig[i].max);
		}, statisticsConfig[i].interval);*/
	}
	
};

function startUpdating(statisticsIndex) {
	 setInterval(function() {
		 var i=statisticsIndex;
    	values[i]=Math.min(Math.max(values[i]+getRandom(statisticsConfig[i].minAddition,statisticsConfig[i].maxAddition),statisticsConfig[i].min),statisticsConfig[i].max);
	}, statisticsConfig[i].interval);
}
exports.getStatistics = function () {
	return values;
};

function getRandom(min,max) {
	return Math.floor(Math.random()*(max-min+1))+min;
}