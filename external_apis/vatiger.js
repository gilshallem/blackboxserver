var ACTION_URL = "http://alfaradar.com/vtigercrm/modules/Webforms/capture.php";
var PUBLIC_ID = "3b061aa05b684bbb4fa18390d64cbc9e";
var FORM_NAME = "Leads from App";

var needle = require('needle');
exports.addLead = function(fname,lname,email,country,phone,language,refCat,ref,callback) {
	needle.post(ACTION_URL, {
		publicid:PUBLIC_ID,
		name:FORM_NAME,
		firstname:fname,
		lastname:lname,
		mobile:phone,
		email:email,
		country:country,
		"label:Language":language,
		"label:Refferal_Category" : refCat,
		"label:Refferal" : ref
	}, function(err, resp, body) {
		if (err) {
			callback(-1,err);
		}
		else {
			var jsonRespond = JSON.parse(body);
			if (jsonRespond.success) {
				callback(0);
			}
			else {
				callback(-1,jsonRespond.error.message);
			}
		}
	});
};