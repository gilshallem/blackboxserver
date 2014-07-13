var SMS_SERVICE_URL =	"https://rest.nexmo.com/sms/json";
var API_SECRET = "b93cf39f";
var API_KEY = "a99f2d5e";

var needle = require('needle');

var responces = {
		"0": {message:"Success",description:"The message was successfully accepted for delivery by Nexmo"},
		"1":{message:"Throttled",description:"You have exceeded the submission capacity allowed on this account, please back-off and retry"},
		"2":{message:"Missing params",description:"Your request is incomplete and missing some mandatory parameters"},
		"3":{message:"Invalid params",description:"The value of one or more parameters is invalid"},
		"4":{message:"Invalid credentials",description:"The api_key / api_secret you supplied is either invalid or disabled"},
		"5":{message:"Internal error",description:"An error has occurred in the Nexmo platform whilst processing this message"},
		"6":{message:"Invalid message",description:"The Nexmo platform was unable to process this message, for example, an un-recognized number prefix or the number is not whitelisted if your account is new"},
		"7":{message:"Number barred",description:"The number you are trying to submit to is blacklisted and may not receive messages"},
		"8":{message:"Partner account barred",description:"The api_key you supplied is for an account that has been barred from submitting messages"},
		"9":{message:"Partner quota exceeded",description:"Your pre-pay account does not have sufficient credit to process this message"},
		"11":{message:"Account not enabled for REST	This account is not provisioned for REST submission, you should use SMPP instead"},
		"12":{message:"Message too long",description:"Applies to Binary submissions, where the length of the UDH and the message body combined exceed 140 octets"},
		"13":{message:"Communication Failed",description:"Message was not submitted because there was a communication failure"},
		"14":{message:"Invalid Signature",description:"Message was not submitted due to a verification failure in the submitted signature"},
		"15":{message:"Invalid sender address",description:"The sender address (from parameter) was not allowed for this message. Restrictions may apply depending on the destination see our FAQs"},
		"16":{message:"Invalid TTL",description:"The ttl parameter values is invalid"},
		"19":{message:"Facility not allowed",description:"Your request makes use of a facility that is not enabled on your account"},
		"20":{message:"Invalid Message class",description:"The message class value supplied was out of range (0 - 3)"}
}

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

exports.getResponseDetails = function(resCode) {
	return responces[resCode];
};