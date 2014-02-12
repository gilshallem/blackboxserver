var strategies = {
	random:require('../strategies/strategy_random')
};

// init all data
var strategy_data = require('../strategies/strategy_data_structure');

for (strategyName in strategies) {
	strategies[strategyName].setData(strategy_data.getEmptyData());
}


exports.getStrategyData = function(startegyName, asset) {
	return strategies[startegyName].getData(asset);
}

exports.getStrategies = function() {
	return strategies;
}
