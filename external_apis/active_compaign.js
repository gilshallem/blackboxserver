var API_URL = "https://george55.api-us1.com";
var API_KEY = "3654a78b6cc8f22f76d882e4e46b278aa7d9a38370be7a0f223615ea1c0ea539af08942e";
var API_ACTION_ADD_CONTACT = "contact_add";
var LIST_NUMBER = 1;
var EVENT_URL = "https://trackcmp.net/event";
var ACT_ID = "25011050";
var EVENT_KEY = "3fe75d2ba9f092d21bcf9de19a5df0317d8f55dc";


var needle = require('needle');

exports.addContact =  function(fname,lname,email,phone,country,language,refCat,ref,callback) {

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
			"field[%COUNTRY%,0]":country,
			"field[%LANGUAGE%,0]":language,
			"field[%REFERRAL_CATEGORY%,0]":refCat,
			"field[%REFERRAL%,0]":ref,
	};
	
	data["p["+LIST_NUMBER+"]"] = LIST_NUMBER;
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

exports.sendEvent = function(email,eventName,eventData,callback) {
	
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

