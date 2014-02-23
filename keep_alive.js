var http = require('http');

exports.keepAlive = function(app,host,port) {
	app.get('/keepalive', function(req, res) {
		res.send("1");	
	});

	setInterval(function() {
		console.log("sending keep alive");
		var options = {
				host: host,
				port: port,
				path: '/keepalive'
		};
		http.get(options, function(res) {
			res.on('error', function(err) {
				console.log("Error (keep alive): " + err.message);
			});
		});
	}, 20 * 60000); // load every 20 minutes
};


