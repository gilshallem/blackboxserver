var API_URL = "https://walof.api-us1.com/admin/api.php";
var API_KEY = "4d2ebe10fb5e4592f1740a52f91f4496af059ac408529ac182de526509f7194243df04da";
var API_ACTION_ADD_CONTACT = "contact_add";
var EVENT_URL = "https://trackcmp.net/event";
var ACT_ID = "648874155";
var EVENT_KEY = "0e4fab9f38e35277e72a0cb58f2844b05aba91b8";


var needle = require('needle');

exports.addContact =  function(fname,lname,email,phone,callback) {

	/*serialize = function(obj) {
		var str = [];
		for(var p in obj)
			if (obj.hasOwnProperty(p)) {
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			}
		return str.join("&");
	}*/

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

exports.sendEvent(email,eventName,eventData,callback) {
	
	var data = {
			actid: ACT_ID, 
			key: EVENT_KEY,
			event: eventName,
			visit: JSON.stringify({email:email})
	}
	
	if (eventData) data.eventdata = eventData;
	
	needle.post(EVENT_URL ,data, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,email);
		}
		else {
			callback(0,null,email);
		}
	});

}

