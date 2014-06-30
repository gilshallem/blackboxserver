var API_URL = "https://walof.api-us1.com/admin/api.php";
var API_KEY = "4d2ebe10fb5e4592f1740a52f91f4496af059ac408529ac182de526509f7194243df04da";
var API_ACTION_ADD_CONTACT = "contact_add";

var needle = require('needle');

exports.addContact =  function(fname,lname,email,phone,callback) {

	serialize = function(obj) {
		var str = [];
		for(var p in obj)
			if (obj.hasOwnProperty(p)) {
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			}
		return str.join("&");
	}

	var data = {
			api_output: 'json',
			api_action: API_ACTION_ADD_CONTACT,
			api_key: API_KEY,
			first_name: fname,
			last_name: lname,
			email: email,
			phone: phone,
			"p[3]":3
	}

	needle.post(API_URL ,data, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,phone);
		}
		else {
			if (parseInt(body.result_code)==1) {
				callback(0,null,phone);
			}
			else {
				callback(-1, body.result_message,phone);
			}
		}
	});
}

