var data; 

exports.interval_min = 4 * 60;
exports.interval_max = 7 * 60;

exports.setData = function(newData) {
	data= newData;
	
}
	
exports.run = function() {
	console.log("Running strategy: random");
	for (asset in data) {
		data[asset] = getRandom(-10,10);
	}
}

exports.getData = function(asset) {
	if (data!=null) return data[asset];
	
}

function getRandom(min,max) {
	return Math.floor(Math.random()*(max-min+1))+min;
}