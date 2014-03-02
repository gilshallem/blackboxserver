var express = require("express");
var logfmt = require("logfmt");
var app = express();
var mongoose = require ("mongoose");
var fruefx = require('./external_apis/true_fx');
var models = require ("./models") // TODO: remove
var phoneValidation = require('./registration/phone_validation');
var registration = require('./registration/registration');
var keepAlive = require('./keep_alive');
var statistics = require('./statistics');

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(logfmt.requestLogger());

//update data
var cronUpdateData =  require('./cron_jobs/update_data');
cronUpdateData.start();

//shrink data
var cronShrinkData =  require('./cron_jobs/shrink_data');
cronShrinkData.start();

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
var getClientAddress = function (req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] 
    || req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};

statistics.start();



app.post('/validateNumber', function(req, res) {
	phoneValidation.sendSMS(req.body.number,getClientAddress(req),function(status,err) {
		res.send(""+status);
		if (!err) console.log("Error validateNumber returned " +status +":" + err);
	});
});

app.post('/register', function(req, res) {
	registration.register(req.body.fname,req.body.lname,req.body.email,req.body.country,req.body.language,req.body.number,req.body.code,function(status,err) {
		res.send(""+status);
		if (!err) console.log("Error validateNumber returned " +status +":" + err);
	});
	
});

app.post('/getHistory', function(req, res) {
	var query = models.ForexHistory.find({ asset:req.body.asset }).select("timestamp bid");
	if (req.body.from!=null) {
		query.where('timestamp').gt(req.body.from);
	}
	query.exec(function(err, result) { 
		if (!err) {
			res.send(JSON.stringify(result));
		} else {
			console.log(err);
			res.send(err);
		};
	}); 
});

app.post('/getStatistics', function(req, res) {
	res.send(JSON.stringify(statistics.getStatistics()));
});






var port = Number(process.env.PORT || 5000);



app.listen(port, function() {
	console.log("Listening on " + port);
});

keepAlive.keepAlive(app,'blackboxserver.herokuapp.com',port);