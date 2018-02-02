var vatiger = require("../external_apis/vatiger");
var blackboxcrm = require("../external_apis/blackboxcrm");
var activeCompaign = require("../external_apis/active_compaign");
var phoneValidation = require('../registration/phone_validation');
var models = require ("../models");

exports.register = function(ip,fname,lname,email,country,language,refCat,ref,number,countryCode,code,callback) {
	console.log("test g1");
	phoneValidation.validatePhone(number,code,function(status,err) {
		// if phone validated
		if (status==0 || status == 1) {
			console.log("test g2");
			isAllreadyRegistered(number,fname,lname,function(isPhoneRegistered) {
				if (isPhoneRegistered) {
					console.log("test g3");
					callback(0);
				}
				else {
					// add lead to the db
					/*models.leads.create({	
						firstName: fname,
						lastName:  lname,
						email:  email,
						country:  country,
						phone:  number,
						language:  language,
						refCat:  refCat,
						ref:  ref,
						sentToCRM: false,
						sentToCRM2: false,
						timestamp: new Date().getTime()
					},function(err) {
						

					});*/
					console.log("test g4");
					blackboxcrm.addLead(ip,fname,lname,email,country,number,countryCode,language,refCat,ref,function(status,err) {
						console.log("test g5");
						if (status==0) {
							//updateLead(number,"sentToCRM2",true);
							
						}
						callback(status,err);
					});
					vatiger.addLead(fname,lname,email,country,number,language,refCat,ref,function(status,err) {
						if (status==0) {
							//updateLead(number,"sentToCRM",true);
						}
					});
					activeCompaign.addContact(fname,lname,email,number,country,language,refCat,ref,function(status,err) {
						if (err) console.log(err);
					});
					
					
				} //end (else of if isregistered)
			});//end of isregistered call

		} // if status =0 || 1
		else {
			callback(status,err);
		}
	});

};

exports.register2 = function(ip,fname,lname,email,country,language,refCat,ref,callback) {
	
			isAllreadyRegistered(number,fname,lname,function(isPhoneRegistered) {
				if (isPhoneRegistered) {
					callback(0);
				}
				else {
					// add lead to the db
					/*models.leads.create({	
						firstName: fname,
						lastName:  lname,
						email:  email,
						country:  country,
						phone:  number,
						language:  language,
						refCat:  refCat,
						ref:  ref,
						sentToCRM: false,
						sentToCRM2: false,
						timestamp: new Date().getTime()
					},function(err) {
						

					});*/
					blackboxcrm.addUser(ip,fname,lname,email,country,language,refCat,ref,function(status,err) {
						if (status==0) {
							//updateLead(number,"sentToCRM2",true);
						}
						callback(status,err);
					});

					activeCompaign.addContact(fname,lname,email,number,country,language,refCat,ref,function(status,err) {
						if (err) console.log(err);
					});
					
					
				}
			});

		
	

};

function updateLead(phone,field,value) {
	models.leads.findOne({phone: phone}, function(err, lead) {
	    if(!err && lead) {
	        lead[field] = value;
	        lead.save(function(err) {
	            if(!err) {
	               // console.log("lead saVED");
	            }
	            else {
	                console.log("Error: could not save lead " + lead.phone);
	            }
	        });
	        
	    }
	});
}

function isAllreadyRegistered(phone,firstName,lastName,callback) {
	var now = new Date().getTime();
	models.leads.findOne({$and: [{ phone: phone},{firstName:firstName},{lastName:lastName}] }
	, function(err, phoneRow)  { 
		if (phoneRow) {
			callback(true);
		}
		else {
			callback(false);
		}


	});
}
