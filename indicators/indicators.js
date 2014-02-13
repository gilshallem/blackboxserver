var ma = require('../indicators/moving_average');
var models = require ("../models");


// add more indicators here
var totalIndicatorCount=1;
function calculate() {
	ma.calculate(10,"ma10",onIndicatorFinished);
}

var totalIndicatorsCalculated;
var idicatorsData=[];
var isUpdating=false;

exports.updateIndicators = function() {
	if (isUpdating) {
		console.log("Error: cant calculate indicators cuz allready calculating");
	}
	else {
		console.log("Updating indicators");
		totalIndicatorsCalculated=0;
		isUpdating=true;
		calculate();
	}
}

function onIndicatorFinished(name,results) {
	
	var now=new Date().getTime();
	var resultIndex;
	for (resultIndex=0;resultIndex< results.length;resultIndex++) {
		var i=0;
		var found=false;
		for (i=0;i<idicatorsData.length;i++) {
			if (idicatorsData[i].asset == results[resultIndex]["_id"]) {
				idicatorsData[i][name] = results[resultIndex]["val"];
				found=true;
				break;
			}
		}
		if (!found) {
			var newRow = {asset:results[resultIndex]["_id"],timestamp:now};
			newRow[name] = results[resultIndex]["val"];
			idicatorsData.push(newRow);
		}
	}
	totalIndicatorsCalculated++;
	if (totalIndicatorsCalculated>=totalIndicatorCount) {
		onAllFinished();
	}
}

function onAllFinished() {
	models.indicators.create(idicatorsData,function() {
		idicatorsData=[];
		isUpdating=false;
		console.log("Update idicators operation complated");
	});
	
}