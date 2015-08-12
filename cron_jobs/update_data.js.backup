var models = require ("../models");
var fruefx = require('../external_apis/true_fx2');
var cronJob = require('cron').CronJob;


var untradableAssets = [];

exports.start = function() {
	// every secound
	var loopUpdator = function() {
		fruefx.getCurrencyUpdates(function(data) {


			updateData(data);
			setTimeout(loopUpdator,1000);
		},function(err) {
			console.log("truefx err: " + err);
			setTimeout(loopUpdator,1000);
		});
	};
	loopUpdator();


}


function updateInterval(interval,asset,bid,offer) {
	var now = new Date();
	// the end time of the current interval
	var intervalTime = new Date( (now.getTime() - ((now.getMinutes() % interval)*60000) - (now.getSeconds()*1000+now.getMilliseconds())) + (60000*interval));
	models.quotes.findOne({asset:asset, interval:interval, timestamp:intervalTime},function(err,currentQuote){
		if (!err) {
			if (currentQuote) {
				var dec =getDec(currentQuote.firstBid);
				currentQuote.close = ((currentQuote.firstBid + offer)/2).toFixed(dec);
				currentQuote.high = Math.max(currentQuote.high,bid);
				currentQuote.low = Math.min(currentQuote.low,offer);
				currentQuote.save(function (err, quote, numberAffected) {
					if (err) {
						console.log(err);
					}
				});
				
			}
			else {
				var dec =getDec(bid);
				currentQuote = {
						timestamp:intervalTime,
						asset:asset,
						interval:interval,
						open: ((bid+offer)/2).toFixed(dec),
						close: ((bid+offer)/2).toFixed(dec),
						low: offer,
						high: bid,
						firstBid: bid
				}
				models.quotes.create(currentQuote);
			}
			
		}

	});


}

function updateData(trueFxOutput) {
	var j;
	var assets=[];
	for (j=0;j<trueFxOutput.length;j++) {
		var assetData = trueFxOutput[j];
		var asset =  assetData[0];
		var bid = parseFloat(assetData[2] + assetData[3]);
		var offer = parseFloat(assetData[4] + assetData[5]);

		updateInterval(1,asset,bid,offer);
		updateInterval(5,asset,bid,offer);
		updateInterval(60,asset,bid,offer);
		updateInterval(60*24,asset,bid,offer);

	}


}



function getDec(number) {
	var str = number+"";
	return str.length-str.indexOf(".")-1;
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



