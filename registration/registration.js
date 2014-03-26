var vatiger = require("../external_apis/vatiger");
var phoneValidation = require('../registration/phone_validation');
var models = require ("../models");

exports.register = function(fname,lname,email,country,language,refCat,ref,number,code,callback) {
	phoneValidation.validatePhone(number,code,function(status,err) {
		// if phone validated
		if (status==0) {
			isAllreadyRegistered(number,function(isPhoneRegistered) {
				if (isPhoneRegistered) {
					callback(0);
				}
				else {
					vatiger.addLead(fname,lname,email,country,number,language,refCat,ref,function(status,err) {
						// add lead to the db
						models.leads.create({	
							firstName: fname,
							lastName:  lname,
							email:  email,
							country:  country,
							phone:  number,
							language:  language,
							refCat:  refCat,
							ref:  ref,
							sentToCRM: status==0,
							timestamp: new Date().getTime()
						},function(err) {
							if (err && status!=0) {
								callback(-1,err);
							}
							else {
								callback(0);
							}

						});



					});
				}
			});

		}
		else {
			callback(status,err);
		}
	});

};

function isAllreadyRegistered(phone,callback) {
	var now = new Date().getTime();
	models.leads.findOne({ phone: phone }
	, function(err, phoneRow)  { 
		if (phoneRow) {
			callback(true);
		}
		else {
			callback(false);
		}


	});
}
