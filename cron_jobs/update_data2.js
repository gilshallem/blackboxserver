var models = require ("../models");
var fruefx = require('../external_apis/true_fx');
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





	//	0 * * * * * every minute
	var generateMinQuotes = new cronJob({
		cronTime: '0 * * * * *',
		onTick: function() {

			var now = new Date();
			var end = new Date( now.getTime() - (now.getSeconds()*1000+now.getMilliseconds()));
			var start =new Date( end.getTime()- 60000);
			models.CurrencyPairs.aggregate([
                    { $match: { timestamp: { $gte:start , $lt: end } } },                            
                    {$group:	{
                    	_id: "$asset",
                    	low: { $min: "$offer" },
                    	high: { $max: "$bid" },
                    	openBid: { $first: "$bid"},
                    	openAsk: { $first: "$offer"},
                    	closeBid: { $last: "$bid"},
                    	closeAsk: { $last: "$offer"},
                    }}
                    ])
            .exec(function(err, result) { 
            	if (!err) {
            		var quotes = [];
            		for (var i=0;i<result.length;i++) {
            			var dec =getDec(result[1].openBid);
            			quotes.push( {
            				asset: result[i]._id,
            				low: result[i].low,
            				high: result[i].high,
            				open:  ((result[i].openBid + result[i].openAsk)/2).toFixed(dec),
            				close: ((result[i].closeBid + result[i].closeAsk)/2).toFixed(dec),
            				interval: 1,
            				timestamp: end
            			});
            		}
            		models.quotes.create(quotes);
            	} else {
            		console.log(err);
            	};
            	//Remove all the remaning signals
    			models.CurrencyPairs.remove({timestamp:{$lt:end}},function(err) {
    				if (err) console.log(err);
    			});
            }); 
		
		},
		start: true

	});
	generateMinQuotes.start();

	//	0 0/5 * * * * every 5 minutes
	generateQuoteAgrigatorCron('0 */5 * * * *',1,5).start();
		
	//	0 0 * * * * every hour
	generateQuoteAgrigatorCron('0 0 * * * *',5,60).start();
	
	//	0 0 0 * * * every day
	generateQuoteAgrigatorCron('0 0 0 * * *',60,60*24).start();
	
}

function generateQuoteAgrigatorCron(cronPattern,sourceInterval,newInterval) {
	return new cronJob({
		cronTime: cronPattern,
		onTick: function() {
			console.log("generateQuoteAgrigatorCron " + cronPattern);
			aggrigateQuotes(sourceInterval,newInterval,function(quotes,err) {
				if (err) {
					console.log(err);
				}
				else {
					models.quotes.create(quotes);
					
				}
			});
		},
		start: true
	});

}

function aggrigateQuotes(sourceInterval,newInterval,callback) {
	var now = new Date();
	var end = new Date( now.getTime() - (now.getSeconds()*1000+now.getMilliseconds()));
	var start =new Date( end.getTime()- (60000*newInterval));
	models.quotes.aggregate([
            { $match: { interval:sourceInterval, timestamp: { $gte:start , $lt: end } } },                            
            {$group:	{
            	_id: "$asset",
            	low: { $min: "$low" },
            	high: { $max: "$high" },
            	open: { $first: "$open"},
            	close: { $last: "$close"},
            }}
            ])
            .exec(function(err, result) { 
            	if (!err) {
            		
            		var quotes = [];
            		for (var i=0;i<result.length;i++) {
            			quotes.push( {
            				asset: result[i]._id,
            				low: result[i].low,
            				high: result[i].high,
            				open:  result[i].open,
            				close: result[i].close,
            				interval: newInterval,
            				timestamp: end
            			});
            		}
            		callback(quotes);
            		
            		
            	} else {
            		callback(null,err);
            		
            	};
            }); 
}
function updateData(trueFxOutput) {
	var j;
	var assets=[];
	for (j=0;j<trueFxOutput.length;j++) {
		var assetData = trueFxOutput[j];
		var asset = {
				asset: assetData[0],
				bid: parseFloat(assetData[2] + assetData[3]),
				offer: parseFloat(assetData[4] + assetData[5]),
				timestamp: new Date()
		}
		assets.push(asset);

	}
	models.CurrencyPairs.create(assets);

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



