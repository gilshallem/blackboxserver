var express = require("express");
var logfmt = require("logfmt");
var app = express();
var mongoose = require ("mongoose");
var strategiesEngine = require('./strategies/strategies_engine');
var fruefx = require('./external_apis/true_fx');
var models = require ("./models") // TODO: remove

//update strategies
var cronRunStrategies =  require('./cron_jobs/run_strategies');
cronRunStrategies.start(strategiesEngine.getStrategies());
//update data
var cronUpdateData =  require('./cron_jobs/update_data');
cronUpdateData.start();


//connect to db
var uristring =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/BlackBoxServer'

	mongoose.connect(uristring, function (err, res) {
		if (err) {
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
		} else {
			console.log ('Succeeded connected to: ' + uristring);
		}
	});

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
	res.send('Hello Worldsss!');
});

app.get('/getUpdates', function(req, res) {
	fruefx.getCurrencyUpdates(function (data) {
		res.setHeader('Content-Type', 'text/plain');
		res.send(data);
	});
});

app.get('/getHistory', function(req, res) {
	models.ForexHistory.find({ asset:"EUR/USD" }).exec(function(err, result) { 
		if (!err) { 
			res.send(JSON.stringify(result));

		} else {
			console.log(err);
			res.send(err);

		};
	}); 
	//res.send("val=" + models.ForexHistory.find({  }));
});

app.get('/getStrategyData', function(req, res) {
	res.send("val=" + strategiesEngine.getStrategyData("random","EUR/USD"));
});

var port = Number(process.env.PORT || 5000);

app.listen(port, function() {
	console.log("Listening on " + port);
});