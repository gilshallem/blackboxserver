var models = require ("../models");
var fruefx = require('../external_apis/true_fx');
var cronJob = require('cron').CronJob;

var MAX_NO_CHANGE = 180000;
var lastUpdate=0;
var assets = {
		"EUR/USD":{bid:0},
		"USD/JPY":{bid:0},
		"GBP/USD":{bid:0},
		"EUR/GBP":{bid:0},
		"USD/CHF":{bid:0},
		"EUR/JPY":{bid:0},
		"EUR/CHF":{bid:0},
		"USD/CAD":{bid:0},
		"AUD/USD":{bid:0},
		"GBP/JPY":{bid:0},
		"AUD/CAD":{bid:0},
		"AUD/CHF":{bid:0},
		"AUD/JPY":{bid:0},
		"AUD/NZD":{bid:0},
		"CAD/CHF":{bid:0},
		"CHF/JPY":{bid:0},
		"EUR/AUD":{bid:0},
		"EUR/CAD":{bid:0},
		"EUR/NOK":{bid:0},
		"EUR/NZD":{bid:0},
		"GBP/CAD":{bid:0},
		"GBP/CHF":{bid:0},
		"NZD/JPY":{bid:0},
		"NZD/USD":{bid:0},
		"USD/NOK":{bid:0},
		"USD/SEK":{bid:0}
		};




exports.start = function () {
    startUpdatingTrueFx();
    startSumming();

}

function startUpdatingTrueFx() {
    var loopUpdator = function () {
        fruefx.getCurrencyUpdates(function (data) {
            updateData(data);
            setTimeout(loopUpdator, 1000);
        }, function (err) {
            console.log("truefx err: " + err);
            setTimeout(loopUpdator, 1000);
        });
    };
    loopUpdator();
}

function startSumming() {
    var job = new cronJob({
        cronTime: '* * * * *',
        onTick: function () {
            if (new Date().getTime() - lastUpdate > 10000) {
                sumData();
            }
            lastUpdate = new Date().getTime();
        },
        start: true

    });
    job.start();
}


exports.isUnchanged = function(assetName) {
    return !isAssetUpdated(assetName);
};

exports.getPrice = function (assetName) {
    if (assets[assetName]) return assets[assetName].bid;
    if (assetName.length == 6) {
        var newName = assetName.substring(0, 3) + "/" + assetName.substring(3, 6);
        if (assets[newName]) return assets[newName].bid
    }
    return null;
};

exports.getUnchangedAssets = function() {
    var unchangedAssets = [];
    var now = new Date().getTime();
    for (assetName in assets) {
        if (!isAssetUpdated(assetName)) {
			unchangedAssets.push(assetName);
		}
    }
	return unchangedAssets;
};

function isAssetUpdated(asset) {
    var now = new Date().getTime();
    return asset && assets[asset] && assets[assetName].lastChange && assets[assetName].lastChange >= now - MAX_NO_CHANGE;
}

exports.getAssetCount = function() {
	
	return Object.keys(assets).length;
};

function sumData() {
    var now = new Date().getTime();
    var newValues = [];
    for (assetName in assets) {
        var bid = assets[assetName].bid;
        if (bid != 0)
            newValues.push({ asset: assetName, bid: bid, timestamp: now });
    }
    if (newValues.length>0)
        models.ForexHistory.create(newValues);
}

function updateData(trueFxOutput) {
    var j;
	var bid;
	var now = new Date().getTime();
	for (assetName in assets) {
		bid = assets[assetName].bid;
		for (j = 0; j < trueFxOutput.length; j++) {
		    var assetData = trueFxOutput[j];
			if (assetData[0]==assetName) {
			    bid = parseFloat(assetData[2] + assetData[3]);
			}
		}
		if (assets[assetName].bid != bid) {
		    assets[assetName].bid = bid;
			assets[assetName].lastChange = now;
		}
		updateSignals(assetName, bid);
		
	}
}



function updateSignals(asset, price) {
    if (price > 0) {

        var query = {
            asset: asset.replace("/", ""), status: 0,
            $or: [
			      {
			          $and: [
                             { power: { $gt: 0 } }, //buy
                             {
                                 $or: [
                                      { $and: [{ "truefx.takeProfit": { $gt: price } }, { takeProfit: { $ne: 0 } }] },
                                      { $and: [{ "truefx.stopLoss": { $lt: price } }, { stopLoss: { $ne: 0 } }] }
                                 ]
                             }
			          ]
			      },
			      {
			          $and: [
                             { power: { $lt: 0 } }, //sell
                             {
                                 $or: [
                                      { $and: [ {"truefx.takeProfit": { $lt: price }},{takeProfit: { $ne: 0 }} ]},
                                      { $and: [{ "truefx.stopLoss": { $gt: price } }, { stopLoss: { $ne: 0 } }] }
                                 ]
                             }
			          ]
			      }
            ]
        };
        //models.signals.find(query).exec(function(err, result) { 
        //}
        models.signals.update(query, {
            $set: {
                status: 1,
                lastUpdated: new Date().getTime(),
                closePrice: price,
                closeTime: new Date().getTime(),
                "truefx.closePrice" : price

            }
        }, function (err, r) {
            if (err) {
                console.log("error closing signals:" + err);
            }
           
            
        })
    }
   // blackboxcrm.sendSignalStatistics(this);
} 
