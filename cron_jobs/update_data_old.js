var models = require ("../models");
var fruefx = require('../external_apis/true_fx');
var cronJob = require('cron').CronJob;

var MAX_UNCHANGE_INTERVALS = 5;
var lastUpdate=0;
var assets = {
		"EUR/USD":{bid:0,noChange:0},
		"USD/JPY":{bid:0,noChange:0},
		"GBP/USD":{bid:0,noChange:0},
		"EUR/GBP":{bid:0,noChange:0},
		"USD/CHF":{bid:0,noChange:0},
		"EUR/JPY":{bid:0,noChange:0},
		"EUR/CHF":{bid:0,noChange:0},
		"USD/CAD":{bid:0,noChange:0},
		"AUD/USD":{bid:0,noChange:0},
		"GBP/JPY":{bid:0,noChange:0},
		"AUD/CAD":{bid:0,noChange:0},
		"AUD/CHF":{bid:0,noChange:0},
		"AUD/JPY":{bid:0,noChange:0},
		"AUD/NZD":{bid:0,noChange:0},
		"CAD/CHF":{bid:0,noChange:0},
		"CHF/JPY":{bid:0,noChange:0},
		"EUR/AUD":{bid:0,noChange:0},
		"EUR/CAD":{bid:0,noChange:0},
		"EUR/NOK":{bid:0,noChange:0},
		"EUR/NZD":{bid:0,noChange:0},
		"GBP/CAD":{bid:0,noChange:0},
		"GBP/CHF":{bid:0,noChange:0},
		"NZD/JPY":{bid:0,noChange:0},
		"NZD/USD":{bid:0,noChange:0},
		"USD/NOK":{bid:0,noChange:0},
		"USD/SEK":{bid:0,noChange:0}
		};




exports.start = function() {
	var job = new cronJob({
		cronTime: '* * * * *',
		onTick: function() {
		    if (new Date().getTime() - lastUpdate > 10000) {
		        
				fruefx.getCurrencyUpdates(updateData);
			}
			lastUpdate = new Date().getTime();
		},
		start: true

	});
	//fruefx.getCurrencyUpdates(updateData);
	job.start();

}

exports.isUnchanged = function(assetName) {
	if (assets[assetName]==null) return null;
	return assets[assetName].noChange >= MAX_UNCHANGE_INTERVALS;
};

exports.getUnchangedAssets = function() {
	var unchangedAssets=[];
	for (assetName in assets) {
		if (assets[assetName].noChange >= MAX_UNCHANGE_INTERVALS) {
			unchangedAssets.push(assetName);
		}
	}
	return unchangedAssets;
};

exports.getAssetCount = function() {
	
	return Object.keys(assets).length;
};



function updateData(trueFxOutput) {
	var j;
	var bid;
	var newValues=[];
	var now = new Date().getTime();
	for (assetName in assets) {
		bid = assets[assetName].bid;
		for (j=0;j<trueFxOutput.length;j++) {
			var assetData = trueFxOutput[j];
			if (assetData[0]==assetName) {
				bid = parseFloat(assetData[2] + assetData[3]);
			}
		}
		if (assets[assetName].bid==bid) {
			assets[assetName].noChange++;
		}
		else {
			assets[assetName].bid=bid;
			assets[assetName].noChange=0;
		}
		newValues.push({asset:assetName,bid: bid,timestamp:now});
		//updateSignals(assetName,bid);
	}
	
	models.ForexHistory.create(newValues);
	

	

}

function updateSignals(asset,price) {
    
	var query = {asset:asset.replace("/",""),status:0,
			$or: [
			      { $and: [
			               {power:{$gt:0}}, //buy
			               {$or:[
			                     {takeProfit:{$lt:price}},
			                     {stopLoss:{$gt:price}}
			                     ]}
			               ]
			      },
			      { $and: [
			               {power:{$lt:0}}, //sell
			               {$or:[
			                     {takeProfit:{$gt:price}},
			                     {stopLoss:{$lt:price}}
			                     ]}
			               ]
			      }
			      ]
	};
	
	models.signals.update(query, {
	    $set: {
	        status: 1,
	        lastUpdated: new Date().getTime(),
            closePrice: price
	    }
	}, function (err,r) {
		if (err) {
			console.log("error closing signals:" + err);
		}
		
	})
} 
