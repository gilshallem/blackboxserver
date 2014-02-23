var http = require('http'); //importing http

exports.keepAlive = function(app) {
	app.get('/keep_alive', function(req, res) {
		res.send("keeping alive");	
	});
	
	setInterval(function() {
        var options = {
            host: 'blackboxserver.herokuapp.com',
            port: 80,
            path: '/keep_alive'
        };
        http.get(options, function(res) {
            res.on('data', function(chunk) {
                try {
                    // optional logging... disable after it's working
                    console.log("HEROKU RESPONSE: " + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error (keep alive): " + err.message);
        });
    }, 20 * 60000); // load every 20 minutes
}


