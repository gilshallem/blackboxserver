var MAX_FOREX_HISTORY		 				= 200;
var MAX_OPEN_SIGNALS_SECOUNDS				= 3600*24*3;
var MAX_SIGNALS_HISTORY_SECOUNDS			= 3600
var MAX_PHONE_VALIDATION_HISTORY_MINUTES 	= 30;
var MAX_TRACKER_MINUTES 					= 60;
var MAX_LEADS_DAYS		 					= 7;
var MAX_FOREX_HISTORY_MINUTES				= 200;//OLD

var models = require ("../models");
var cronJob = require('cron').CronJob;


exports.start = function() {
	var job = new cronJob({
		cronTime: '*/10 * * * *',
		onTick: function() {
			console.log("shrinking db");
			//shrinkForexData();
			shrinkForexData_OLD();
			shrinkPhoneValidation();
			shrinkTracker();
			shrinkLeads();
			shrinkSignals();
		},
		start: true

	});
	job.start();
}

function shrinkSignals() {
	var now = new Date().getTime();
	var before = now - (MAX_SIGNALS_HISTORY_SECOUNDS * 1000);
	var beforeOpen = now - (MAX_OPEN_SIGNALS_SECOUNDS * 1000);
	models.signals.remove({
		$or:[
		     {status:0, lastUpdated:{$lt: beforeOpen}},
		     {status:1, lastUpdated:{$lt: before}}
		     ]}, function(err) {
	
		if (!err) {
			console.log("Old signals removed");
			
		}
		else {
			console.log("Error removing signals: "+ err.message);
		}
	});
	
	
}

function shrinkForexData_OLD() {
	var now = new Date().getTime();
	var before = now - (MAX_FOREX_HISTORY_MINUTES * 60000);
	models.ForexHistory.remove({ timestamp:{$lt: before} }, function(err) {
		if (!err) {
			console.log("Old data removed");
			
		}
		else {
			console.log("Error removing data: "+ err.message);
		}
	});
}
function shrinkForexData() {
	srinkQuotes(1);
	srinkQuotes(5);
	srinkQuotes(60);
	srinkQuotes(60*24);
}

function srinkQuotes(interval) {
	var now = new Date().getTime();
	var before = now - (MAX_FOREX_HISTORY * 60000*interval);
	models.quotes.remove({interval:interval, timestamp:{$lt: before} });
}

function shrinkPhoneValidation() {
	var now = new Date().getTime();
	var before = now - (MAX_PHONE_VALIDATION_HISTORY_MINUTES * 60000);
	models.phoneValidate.remove({ timestamp:{$lt: before} }, function(err) {
		if (!err) {
			console.log("Old data removed");
			
		}
		else {
			console.log("Error removing data: "+ err.message);
		}
	});
}

function shrinkTracker() {
	var now = new Date().getTime();
	var before = now - (MAX_TRACKER_MINUTES * 60000);
	models.tracker.remove({ timestamp:{$lt: before} }, function(err) {
		if (!err) {
			console.log("Old data removed");
			
		}
		else {
			console.log("Error removing data: "+ err.message);
		}
	});
}


function shrinkLeads() {
	var now = new Date().getTime();
	var before = now - (MAX_LEADS_DAYS * 86400000);
	models.leads.remove({ timestamp:{$lt: before} }, function(err) {
		if (!err) {
			console.log("Old leads removed");
			
		}
		else {
			console.log("Error removing leads: "+ err.message);
		}
	});
}
