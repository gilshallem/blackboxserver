var vatiger = require("../external_apis/vatiger");
var phoneValidation = require('../registration/phone_validation');

exports.register = function(fname,lname,email,country,language,refCat,ref,number,code,callback) {
	phoneValidation.validatePhone(number,code,function(status,err) {
		if (status==0) {
			vatiger.addLead(fname,lname,email,country,number,language,refCat,ref,callback);
		}
		else {
			callback(status,err);
		}
	});
	
};
