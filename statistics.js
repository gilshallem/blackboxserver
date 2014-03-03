var statisticsConfig = [
	{
		min:200,
		max:800,
		maxAddition:5,
		minAddition:-5,
		interval:30000,
		format:"{0}"
	},
	{
		min:1.2,
		max:4,
		maxAddition:0.1,
		minAddition:-0.1,
		interval:30*60000,
		format:"{0}K"
	}
];

var values=[];
var strings=[];
 
String.prototype.format = function() {
    var formatted = this;
    for( var arg in arguments ) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};
exports.start = function() {
	for (i = 0; i < statisticsConfig.length; i++) {
	    values[i] = getRandom(statisticsConfig[i].min,statisticsConfig[i].max);
	    strings[i] =getForamttedStatString(i);
	    startUpdating(i);
	}
	
};

function getForamttedStatString(statisticsIndex) {
	val = values[statisticsIndex];
	if (val%1>0) val= val.toFixed(1);
	return statisticsConfig[statisticsIndex].format.format( val);
}

function startUpdating(statisticsIndex) {
	 setInterval(function() {
		var i=statisticsIndex;
    	values[i]=Math.min(Math.max(values[i]+getRandom(statisticsConfig[i].minAddition,statisticsConfig[i].maxAddition),statisticsConfig[i].min),statisticsConfig[i].max);
    	strings[i] =getForamttedStatString(i);
	 
	 }, statisticsConfig[i].interval);
}
exports.getStatistics = function () {
	return strings.slice(0);
};

function getRandom(min,max) {
	return Math.floor(Math.random()*(max-min+1))+min;
}