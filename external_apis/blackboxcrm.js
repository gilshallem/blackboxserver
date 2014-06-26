var ACTION_URL = "http://blackboxcrm.herokuapp.com/api";
//ACTION_URL = "http://127.0.0.1:3000/api";
var needle = require('needle');
exports.addLead = function(ip,fname,lname,email,country,phone,countryCode,language,refCat,ref,callback) {
	needle.post(ACTION_URL, {
		action:"upsert",
		model:"leads",
		"key:number:phone":phone,
		"field:text:countryCode":countryCode,
		"field:text:ip":ip,
		"field:text:fname":fname,
		"field:text:lname":lname,
		"field:text:email":email,
		"field:options:country":country,
		"field:options:Language":language,
		"field:options:Refferal_Category" : refCat,
		"field:options:Refferal" : ref
	}, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,phone);
		}
		else {
			callback(0,null,phone);
		}
	});
};

exports.sendBrokerFeed = function(number,contacted , account , executed , rating , comments,callback) {
	needle.post(ACTION_URL, {
		action:"upsert",
		model:"leads",
		"key:number:phone":number,
		"field:bool:broker_contacted":contacted,
		"field:bool:broker_open_account":account,
		"field:bool:broker_executed_signals":executed,
		"field:float:broker_rating":rating,
		"field:text:broker_comments":comments
	}, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,number);
		}
		else {
			callback(0,null,number);
		}
	});
};

exports.onShare = function(number,network ,userId, action , callback) {
	var params = {
			action:"upsert",
			model:"leads",
			"key:number:phone":number
			
		};
	params["field:" + network.toLowerCase() + ":" + network.toLowerCase() + "_id"] = userId;
	needle.post(ACTION_URL,params , function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,number);
		}
		else {
			callback(0,null,number);
		}
	});
};

exports.sendExecuted = function (phone,callback)  {
	needle.post(ACTION_URL, {
		action:"upsert",
		model:"leads",
		"key:number:phone":phone,
		"field:bool:executed":true
	}, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,phone);
		}
		else {
			callback(0,null,phone);
		}
	});
	
};


exports.addFacebook = function (fId,number) {
	//TODO:
};