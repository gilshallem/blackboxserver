var appSettings = {
		showPlus500:false,
		minVersion:27
} 

var GA_ID = "UA-48596629-2";
var express = require("express");
var logfmt = require("logfmt");
var mongoose = require ("mongoose");
var fruefx = require('./external_apis/true_fx');
var models = require ("./models"); // TODO: remove
var phoneValidation = require('./registration/phone_validation');
var registration = require('./registration/registration');
var cupons = require('./features/cupons');
var shares = require('./features/shares');
var keepAlive = require('./keep_alive');
var statistics = require('./statistics');
var ip2cc = require('ip2cc');
var pixelTracker= require('pixel-tracker')
var ua = require("universal-analytics");
var tracker  = require ("./tracker");
var e164 = require('e164');
var country_lookup = require('country-data').lookup;
var blackboxcrm = require("./external_apis/blackboxcrm");
var nexmo = require('./external_apis/nexmo');
var activeCompaign = require("./external_apis/active_compaign");


var app = express();

app.use(express.static(__dirname + '/public'));

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(logfmt.requestLogger());
app.use(express.cookieParser("blackbox"));
app.use(ua.middleware(GA_ID, {cookieName: '_ga'}));



pixelTracker.use(function (error, result) {
	//console.log(result)
	/*
	  {
	    "cookies": { "_tracker": "58f911166e6d31041eba8d06e11e3f77" },
	    "host": "localhost:3000",
	    "cache": { "max-age": "0" },
	    "referer": "direct",
	    "params": [],
	    "decay": 1342597993859,
	    "useragent": { "browser": "Chrome", "version": "20.0" },
	    "language": [ "en-US", "en", { "q": "0.8" } ],
	    "geo": { "ip": "127.0.0.1" },
	    "domain": "localhost"
	  }
	 */

	// save to google statistics
	var visitor;
	if (result.cookies!=null && result.cookies._tracker!=null) {
		visitor= ua(GA_ID, result.cookies._tracker);
	} 
	else {
		visitor= ua(GA_ID);
	}
	visitor.event(result.cat, "Seen" ,result.ref,function(err) {
		if (err) {
			console.log("err analitics seen=" + err);
		}
	}).send()

	// upsert ip
	tracker.registerUser(result.geo.ip,result.cat,result.ref,result.override,
			function() {
		//console.log("ip registered");
	},
	function() {
		console.log("ip registeration error");
	});


});

//dont kill server on errors
process.on('uncaughtException', function (err) {
	console.log(err);
}); 

//update data
var cronUpdateData_OLD =  require('./cron_jobs/update_data_old');
cronUpdateData_OLD.start();

//update data
//var cronUpdateData =  require('./cron_jobs/update_data');
//cronUpdateData.start();

//check market
//var cronCheckMarket =  require('./cron_jobs/check_market');
//cronCheckMarket.start();

//shrink data
var cronShrinkData =  require('./cron_jobs/shrink_data');
cronShrinkData.start();

//send pending leads
//var cronSendLeads =  require('./cron_jobs/send_leads');
//cronSendLeads.start();

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

app.use(function (req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "X-Requested-With");
	  next();      
	}); 

app.post('/getMinVersion', function(req, res) {
	res.send(appSettings.minVersion+"");
	
});


app.post('/getSettings', function(req, res) {
	res.send(appSettings);
	
});


app.post('/openApp', function(req, res) {
	if (req.body.cat && req.body.ref) {
		var visitor= ua(GA_ID);
		visitor.event(req.body.cat, "Downloaded" ,req.body.ref,function(err) {
			console.log("err=" + err);
		}).send();
		res.send("0");
	}
	else {
		tracker.getRef(getClientAddress(req),function(ref,cat) {
			if (ref && cat) {
				var visitor= ua(GA_ID);
				visitor.event(cat, "Downloaded" ,ref,function(err) {
					console.log("err=" + err);
				}).send();
				res.send("0");
			}
			else {
				res.send("1");
			}

		},function() {
			console.log("Error looking for tracker user");
		});
	}



});
app.all('/test', function (req,res) {

});

app.all('/pixel.gif', pixelTracker.middleware);
app.get('/link', function (req,res) {
	if (req.query.cat && req.query.ref) {
		var token = tracker.getTrackerId(req,res);
		visitor= ua(GA_ID, token);
		visitor.event(req.query.cat, "Clicked" ,req.query.ref,function(err) {
			if (err) {
				console.log("err analitics clicked=" + err);
			}
		}).send();

		// upsert ip
		tracker.registerUser(getClientAddress(req),req.query.cat,req.query.ref,req.query.override,
				function() {
			console.log("ip registered");

		},
		function() {
			console.log("ip registeration error");
		});
	}
	var redUrl = req.query.u;
	if (redUrl==null) redUrl = "https://play.google.com/store/apps/details?id=com.gilapps.forexblackbox&referrer={ref:" + req.query.ref + ",cat:" + req.query.cat + "}";
	res.redirect(redUrl);
});

app.post('/executeSignal',function(req,res) {
	if (req.body.number) {
		blackboxcrm.brokermatch(req.body.number,function(broker,err) {
			if (err || !broker) {
				res.send("-1");
				console.log(err);
			}
			else {
				res.send("0");
			}
		});
	}
	else {
		res.send("-1");
	}

});

app.post('/getDetails',function(req,res) {
	if (req.body.number) {
		blackboxcrm.getDetails(req.body.number,function(details,err) {
			if (err || !details) {
				res.writeHead(400);
				res.end();
			}
			else {
				res.send(details);
			}
		});
	}

	else {
		res.writeHead(400);
		res.write("No number");
		res.end();
	}
});
	

app.post('/getBroker',function(req,res) {
	if (req.body.number) {
		blackboxcrm.getBroker(req.body.number,function(broker,err) {
			if (err || !broker) {
				res.writeHead(400);
				try {
					var parsed = JSON.parse(err);
					if (parsed && parsed.errorNum == 1) {
						// No Broker 
						res.write(2+"");
					}
					else {
						res.write(1+"");
					}
				}
				catch (e) {
					res.write(1+"");
				}

				res.end();
			}
			else {
				res.send(broker);
			}
		});
	}

	else {
		res.writeHead(400);
		res.write("No number");
		res.end();
	}

});

app.post('/sendLead',function(req,res) {
	if (req.body.number) {
		blackboxcrm.sendLead(req.body.number,req.body.fname,req.body.lname,req.body.source,function(err,phone) {
			if (err) {
				res.writeHead(400);
				console.log(err);
				res.end();
			}
			else {
				if (req.body.email) {
					activeCompaign.sendEvent(req.body.email,"Lead Sent",req.body.broker,function(){});
				}
				res.send("0");
			}
		});
	}

	else {
		res.writeHead(400);
		res.write("No number");
		res.end();
	}

});

/*app.post('/brokermatch',function(req,res) {
	if (req.body.number) {
		blackboxcrm.brokermatch(req.body.number,function(broker,err) {
			if (err || !broker) {
				res.writeHead(400);
				console.log(err);
				if (err=="No Broker") {
					res.write(2+"");
				}
				else {
					res.write(1+"");
				}
				
				res.end();
			}
			else {
				if (req.body.email) {
					activeCompaign.sendEvent(req.body.email,"Broker_Matched",broker,function(){});
				}
				
				res.send(broker);
				
			}
			
		});
		
	}
	else {
		res.writeHead(400);
		res.write("No number");
		res.end();
	}

});
*/


app.post('/experienced',function(req,res) {
	if (req.body.number) {
		blackboxcrm.sendExperienced(req.body.number,function(statusCode) {
			res.send(statusCode+"");
		})
	}
	else {
		res.send(-1);
	}

});

app.post('/feedBroker',function(req,res) {
	if (req.body.number!=null && req.body.contacted!=null && req.body.account!=null && req.body.executed!=null && req.body.rating!=null && req.body.comments!=null) {
		blackboxcrm.sendBrokerFeed(req.body.number,req.body.contacted , req.body.account , req.body.executed , req.body.rating , req.body.comments,function(statusCode,err,phone) {
			console.log("Sending broker feed to " + phone + ". Error " + statusCode + ": " + err);
			res.send(statusCode+"");
		})
	}
	else {
		res.send(-1);
	}

});

app.post('/canShare',function(req,res) {
	shares.canShare(req.body.phone,req.body.network,req.body.shareId,req.body.action,function(timeToNextShare) {
		res.send(timeToNextShare+"");
	});
});

app.post('/onShared',function(req,res) {
	shares.onShared(req.body.phone,req.body.network,req.body.shareId,req.body.action,function(statusCode) {
		res.send(statusCode+"");
	});
});
app.all('/getShares', function(req, res) {
	if (req.body.pass=="gil113322") { 
		models.shares.find().exec(function(err, result) { 
			if (!err) {
				var html = "<html><head></head><body><table border='1' width='100%'>";
				html = html + "<tr><td>Id</td><td>Time</td></tr>"
				var share;
				for (var i = 0; i < result.length; i++) {
					share = result[i];
					html = html + "<tr>";
					html = html + "<td>" + share.id + "</td>";
					html = html + "<td>" + share.time + "</td>";
					html = html + "</tr>";
				}
				html = html + "</table></body></html>"
				res.send(html);
			} else {
				console.log(err);
				res.send(err);
			};
		}); 
	} // pass check end
});

app.post('/createCupon', function(req,res) {
	if (req.body.pass=="gil113322") { 
		var expiry =new Date( req.body.expiry).getTime();
		cupons.createCupon(expiry,req.body.duration,function(code,err) {
			if (err) {
				res.send("Error: " + err);
			}
			else {
				res.send("Cupon Created - Code: " + code);
			}
		});

	}

});

app.post('/useCupon', function(req,res) {
	cupons.useCupon(req.body.account,req.body.number,req.body.code,function(statusCode) {
		res.send(statusCode+"");
	});
});



app.all('/getCupons', function(req, res) {
	if (req.body.pass=="gil113322") { 
		models.cupons.find().exec(function(err, result) { 
			if (!err) {
				var html = "<html><head></head><body><table border='1' width='100%'>";
				html = html + "<tr><td>Account</td><td>Number</td><td>Code</td><td>Activation Time</td><td>Duration</td><td>Expiry</td></tr>"
				var cupon;
				for (var i = 0; i < result.length; i++) {
					cupon = result[i];
					var expiryTime = new Date(cupon.expiryTime).toISOString().replace(/T/, ' ').replace(/\..+/, '');

					var activationTime;
					if (cupon.activationTime) activationTime= new Date(cupon.activationTime).toISOString().replace(/T/, ' ').replace(/\..+/, '');
					html = html + "<tr>";
					html = html + "<td>" + cupon.account + "</td>";
					html = html + "<td>" + cupon.number + "</td>";
					html = html + "<td>" + cupon.code + "</td>";
					html = html + "<td>" + activationTime + "</td>";
					html = html + "<td>" + cupon.durationDays + "</td>";
					html = html + "<td>" + expiryTime + "</td>";
					html = html + "</tr>";
				}
				html = html + "</table></body></html>"
				res.send(html);
			} else {
				console.log(err);
				res.send(err);
			};
		}); 
	} // pass check end
});

app.post('/getLeads', function(req, res) {
	if (req.body.pass=="gil113322") { 
		models.leads.find().sort([['timestamp', 'descending']]).exec(function(err, result) { 
			if (!err) {
				var html = "<html><head></head><body><table border='1' width='100%'>";
				html = html + "<tr><td>Date</td><td>First Name</td><td>Last Name</td><td>Email</td><td>Phone</td><td>Country</td><td>Language</td><td>Category</td><td>Reffereal</td><td>Sent to CRM</td></tr>"
				var lead;
				for (var i = 0; i < result.length; i++) {
					lead = result[i];
					var date = new Date(result[i].timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');
					html = html + "<tr>";
					html = html + "<td>" + date + "</td>";
					html = html + "<td>" + result[i].firstName + "</td>";
					html = html + "<td>" + result[i].lastName + "</td>";
					html = html + "<td>" + result[i].email + "</td>";
					html = html + "<td>" + result[i].phone + "</td>";
					html = html + "<td>" + result[i].country + "</td>";
					html = html + "<td>" + result[i].language + "</td>";
					html = html + "<td>" + result[i].refCat + "</td>";
					html = html + "<td>" + result[i].ref + "</td>";
					html = html + "<td>" + result[i].sentToCRM + "</td>";
					html = html + "</tr>";
				}
				html = html + "</table></body></html>"
				res.send(html);
			} else {
				console.log(err);
				res.send(err);
			};
		}); 
	} // pass check end
});
app.post('/getCountry', function(req, res) {
	res.send(getCountry(req.body.number),"192.123.123.32","test");
});
var getCountry = function(number,ip,defaultCountry) {
	var country = e164.lookup(number);
	try {
	if (country==null) country=ip2cc.lookUp(ip);
	} catch (e) {}
	if (country==null) country=defaultCountry;
	//Convert to code
	if (country && country.length>2) {
		var countryData = country_lookup.countries({name: country});
		if (countryData && countryData.length>0) {
			if (countryData[0].alpha2) {
				country = countryData[0].alpha2;
			} 
			else {
				if (countryData[0].alpha3) {
					country = countryData[0].alpha3;
				}
			}
		}

	}
	
	return country;
}



app.post('/validateNumber', function(req, res) {
	var ip = getClientAddress(req);
	
	phoneValidation.sendSMS(req.body.number,ip,function(status,err) {
		//res.send(""+status);
		
		if (err) {
			console.log("Error validateNumber returned " +status +":" + err);
		}
		//If its an error from nexmo
		if (status>100) {
			if (status!=106) {
				var error = nexmo.getResponseDetails(status-100);
				if (error) {
					blackboxcrm.notify("SMS Verification Error","Faild to send SMS to client","Number: " + req.body.number + "<br />Error number: " + status + "<br />Error message: " + error.message + "<br />Description: " + error.description ,"warning",true,function(){});
				}
				else {
					blackboxcrm.notify("SMS Verification Error","Faild to send SMS to client","Number: " + req.body.number + "<br />Error number: " + status + "<br />Error message: " + err,"warning",true,function(){});
				}
			}
			res.send("6");
		}
		else {
			res.send(""+status);
		}
	});
});


app.post('/setSubscription', function(req, res) {
	
	blackboxcrm.updateSubscription(req.body.number,req.body.orderId ? req.body.orderId : req.body.orderID,function(status,err) {
		res.send(""+status);
	});
});

app.get('/approvePhone', function(req, res) {
	if (req.query.password=="gil113322" && req.query.number) {
		var newNumber  =new models.approvedNumbers({
			number:req.query.number,
			timestamp: new Date().getTime()
		});
		newNumber.save(function(dbErr) {
			if (dbErr) {
				res.send("Error: " + dbErr);
			}
			else {
				res.send("Success");
			}
		});
	}
	else {
		res.send("Bad Password");
	}
	
});

app.post('/setAppsFlyer', function(req, res) {
	
	blackboxcrm.updateAF(req.body.number,req.body.compaign,req.body.media,req.body.agency,req.body.id,req.body.clickTime,req.body.installTime,req.body.siteId,req.body.fbAdGroup,req.body.fbAdSet,function(status,err) {
		res.send(""+status);
	});
});

app.post('/signalStatistics', function(req, res) {
	blackboxcrm.signalStatistics(req.body.strategy,req.body.asset,req.body.signalTime,req.body.direction,req.body.power,req.body.bid,req.body.stopLoss,req.body.takeProfit,req.body.won,req.body.avgJump,req.body.tpPeriod,req.body.slPeriod,req.body.potentialSL,req.body.potentialTP,req.body.min5,req.body.min10,req.body.min15,req.body.max5,req.body.max10,req.body.max15,function(status,err) {
		res.send(""+status);
	});
});


app.post('/register', function(req, res) {
	var registerFunc = function(ref,cat) {
		var ip = getClientAddress(req);
		var country = getCountry(req.body.number,ip,req.body.country);
		registration.register(ip,req.body.fname,req.body.lname,req.body.email,country,req.body.language,cat,ref,req.body.number,req.body.country_code,req.body.code,function(status,err) {
			res.send(""+status);
			if (err) {
				console.log("Error /register returned " +status +":" + err);
			}
			if (status==0) {
				//analitcs
				if (ref && cat) {
					var visitor= ua(GA_ID);
					visitor.event(cat, "Lead" ,ref,function(err) {
						console.log("stat Lead err=" + err);
					}).send();

				}
			}

		});

	};
	if (req.body.cat && req.body.ref) { 
		registerFunc(req.body.ref,req.body.cat);
	}
	else {
		tracker.getRef(getClientAddress(req),registerFunc,function() {
			console.log("Error looking for tracker user");
			res.send("88");
		});
	}





});



app.post('/register2', function(req, res) {
	var registerFunc = function(ref,cat) {
		var ip = getClientAddress(req);
		registration.register2(ip,req.body.fname,req.body.lname,req.body.email,req.body.country,req.body.language,cat,ref,function(status,err) {
			res.send(""+status);
			if (err) {
				console.log("Error /register returned " +status +":" + err);
			}
			if (status==0) {
				//analitcs
				if (ref && cat) {
					var visitor= ua(GA_ID);
					visitor.event(cat, "Lead" ,ref,function(err) {
						console.log("stat Lead err=" + err);
					}).send();

				}
			}

		});

	};
	if (req.body.cat && req.body.ref) { 
		registerFunc(req.body.ref,req.body.cat);
	}
	else {
		tracker.getRef(getClientAddress(req),registerFunc,function() {
			console.log("Error looking for tracker user");
			res.send("88");
		});
	}





});

app.post('/getQuotes', function(req, res) {
	var query = models.quotes.find({ asset:req.body.asset,interval:req.body.interval });
	if (req.body.from!=null) {
		query.where('timestamp').gt(req.body.from);
	}
	query.exec(function(err, result) { 
		if (!err) {
			var quotes = [];
			for (var i=0;i<result.length;i++) {
				var q = result[i];
				quotes.push({
					timestamp: q.timestamp.getTime(),
					open: q.open,
					close: q.close,
					low: q.low,
					high: q.high
				});
			}
			res.send(JSON.stringify(quotes));
		} else {
			console.log(err);
			res.send(err);
		};
	}); 
});

//dispeached
app.post('/getHistory', function(req, res) {
	var query = models.ForexHistory.find({ asset:req.body.asset }).select("timestamp bid");
	if (req.body.from!=null) {
		query.where('timestamp').gt(req.body.from);
	}
	query.exec(function(err, result) { 
		if (!err) {
			res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
			res.header('Expires', '-1');
			res.header('Pragma', 'no-cache');
			res.send(JSON.stringify(result));
		} else {
			console.log(err);
			res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
			res.header('Expires', '-1');
			res.header('Pragma', 'no-cache');
			res.send(err);
		};
	}); 
});

app.post('/getTradeable', function(req, res) {
	res.send(cronUpdateData_OLD.getUnchangedAssets());
});

app.post('/getStatistics', function(req, res) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	var totalTradable = cronUpdateData_OLD.getAssetCount() - cronUpdateData_OLD.getUnchangedAssets().length;
	if (totalTradable>0) {
		var stats=statistics.getStatistics();
		stats.push(""+totalTradable);
		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		res.header('Expires', '-1');
		res.header('Pragma', 'no-cache');
		res.send(JSON.stringify(stats));
	}
	else {
		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		res.header('Expires', '-1');
		res.header('Pragma', 'no-cache');
		res.send(JSON.stringify(["0","0","0"]));
	}
});

app.post('/getSignals', function(req, res) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	var query = models.signals.find({ asset:req.body.asset, strategy: req.body.strategy });
	if (req.body.from!=null) {
		query.where('server_timestamp').gt(req.body.from);
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

app.post('/addSignal', function(req, res) {
	
		var newSignal  =new models.signals({
			strategy:  req.body.strategy,
			asset:  req.body.asset,
			power:  req.body.power,
			price:  req.body.bid,
			stopLoss:  req.body.sl,
			takeProfit:  req.body.tp,
			timestamp: parseInt ( req.body.timestamp),
			server_timestamp: new Date().getTime()
			
			
		});
		newSignal.save(function(dbErr) {
			if (dbErr) {
				res.send("Error: " + dbErr);
			}
			else {
				res.send("Success");
			}
		});
	
	
});




var port = Number(process.env.PORT || 2000);

app.listen(port, function() {
	console.log("Listening on " + port);
});
/*
var app2 = express();
app2.all('/', function(req, res) {
	console.log("test");
	res.send("test");
});
app2.listen(9012, function() {
	console.log("Listening on " + 9999);
});*/






//keepAlive.keepAlive(app,'blackboxserver.herokuapp.com',port);