var SMS_SERVICE_URL =	"https://rest.nexmo.com/sms/json";
var API_SECRET = "ce4cc46e";
var API_KEY = "f6d593ee";

var needle = require('needle');

exports.sendSMS=function(from,to,text,callback) {
	needle.post(SMS_SERVICE_URL, {
		api_key:API_KEY,
		api_secret:API_SECRET,
		from:from,
		to:to,
		text:text
	}, function(err, resp, body) {
		if (err) {
			callback(ERROR_SERVER,err);
		}
		else {
			var status = parseInt( body.messages[0].status);
			if (status==0) {
				callback(0);
			}
			else {
				callback(status,status,body.messages[0]["error-text"]);
			}
		}
	});
}