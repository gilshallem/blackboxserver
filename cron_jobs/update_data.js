var models = require ("../models");
var fruefx = require('../external_apis/true_fx');
var cronJob = require('cron').CronJob;

var assets = {"EUR/USD":0,"USD/JPY":0,"GBP/USD":0,"EUR/GBP":0,
		"USD/CHF":0,"EUR/JPY":0,"EUR/CHF":0,"USD/CAD":0,
		"AUD/USD":0,"GBP/JPY":0,"AUD/CAD":0,"AUD/CHF":0,
		"AUD/JPY":0,"AUD/NZD":0,"CAD/CHF":0,"CHF/JPY":0,
		"EUR/AUD":0,"EUR/CAD":0,"EUR/NOK":0,"EUR/NZD":0,
		"GBP/CAD":0,"GBP/CHF":0,"NZD/JPY":0,"NZD/USD":0,
		"USD/NOK":0,"USD/SEK":0};

var MAX_HISTORY_MINUTES = 10;



exports.start = function() {
	var job = new cronJob({
		cronTime: '* * * * *',
		onTick: function() {
			fruefx.getCurrencyUpdates(updateData);
		},
		start: false

	});
	fruefx.getCurrencyUpdates(updateData);
	job.start();

}




function updateData(trueFxOutput) {
	var j;
	var bid;
	var newValues=[];
	var now = new Date().getTime();
	for (assetName in assets) {
		bid = assets[assetName];
		for (j=0;j<trueFxOutput.length;j++) {
			var assetData = trueFxOutput[j];
			if (assetData[0]==assetName) {
				bid = parseFloat(assetData[2] + assetData[3]);
			}
		}
		assets[assetName]=bid;
		newValues.push({asset:assetName,bid: bid,timestamp:now});
	}
	var before = now - (MAX_HISTORY_MINUTES * 60000);
	models.ForexHistory.remove({ timestamp:{$lt: before} }, function(err) {
		if (!err) {
			console.log("Old data removed");
			
		}
		else {
			console.log("Error removing data: "+ err.message);
		}
	});
	
	models.ForexHistory.create(newValues);
	

	

}