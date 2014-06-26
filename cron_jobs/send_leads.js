var models = require ("../models");
var cronJob = require('cron').CronJob;
var vatiger = require("../external_apis/vatiger");
var blackboxcrm = require("../external_apis/blackboxcrm");
var jobIsRunning = false;
exports.start = function() {
	sendPendingLeads ();
	var job = new cronJob({
		cronTime: '*/3 * * * * *',
		onTick: function() {
			if (!jobIsRunning) {
				jobIsRunning=true;
				console.log("Sending pending leads")
				
				sendPendingLeads(null,function() {
					sendPendingLeads(2,function() {
						jobIsRunning=false;
					});
				});
			}
			
			
		},
		start: true

	});
	job.start();
}

function sendPendingLeads (crmNum,callback,skip) {
	console.log("sendPendingLeads");
	var sentToCRMField = "sentToCRM";
	if (crmNum==2) {
		sentToCRMField = "sentToCRM2";
	}
	var selector={};
	selector[sentToCRMField]=false;
	if (skip==null) skip=0;
	console.log("sendPendingLeads 2");
	models.leads.findOne(selector,{skip:skip}).exec(function(err, result) {
		if (!err && result) {
			console.log("sendPendingLeads 3");
			var lead = result;
			var onSent = function(status,err,phone) {
				if (status==0) {
					updateLead(phone,sentToCRMField,true,function(err) {
						console.log("sendPendingLeads 4");
						if (err) {
							sendPendingLeads(crmNum,callback,++skip);
						}
						else {
							sendPendingLeads(crmNum,callback,skip);
						}
					});
				}
				else {
					sendPendingLeads(crmNum,callback,++skip);
				}
				
			};
			if (crmNum==2) {
				blackboxcrm.addLead(lead.firstName,lead.lastName,lead.email,lead.country,lead.phone,lead.language,lead.refCat,lead.ref,onSent);
			}
			else {
				vatiger.addLead(lead.firstName,lead.lastName,lead.email,lead.country,lead.phone,lead.language,lead.refCat,lead.ref,onSent);
			}


		}
		else {
			console.log(err);
			callback();
		}
	});
}
function updateLead(phone,field,value,callback) {
	models.leads.findOne({phone: phone}, function(err, lead) {
		if(!err && lead) {
			lead[field] = value;
			lead.save(callback);

		}
	});
}

