var ACTION_URL = "http://blackboxcrm.herokuapp.com/api";

var needle = require('needle');
exports.addLead = function(fname,lname,email,country,phone,language,refCat,ref,callback) {
	needle.post(ACTION_URL, {
		action:"upsert",
		model:"leads",
		"key:number:phone":phone,
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