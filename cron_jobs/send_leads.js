var models = require ("../models");
var cronJob = require('cron').CronJob;
var vatiger = require("../external_apis/vatiger");

exports.start = function() {
	sendPendingLeads ();
	var job = new cronJob({
		cronTime: '*/10 * * * *',
		onTick: function() {
			sendPendingLeads();
		},
		start: true

	});
	job.start();
}

function sendPendingLeads () {
	models.leads.find({sentToCRM:false}).exec(function(err, result) {
		if (!err && result) {
			console.log("Sending pending leads")
			var lead;
			for (var i = 0; i < result.length; i++) {
				lead = result[i];
				vatiger.addLead(lead.firstName,lead.lastName,lead.email,lead.country,lead.phone,lead.language,lead.refCat,lead.ref,function(status,err,phone) {
					if (status==0) {
						updateSentToCRM(phone);
					}
					
				});
			}
		}
	});
}


function updateSentToCRM(phone) {
	console.log("Saving " + phone);
	models.leads.findOne({phone: phone}, function(err, lead) {
	    if(!err && lead) {
	        lead.sentToCRM = true;
	        lead.save(function(err) {
	            if(!err) {
	                console.log("lead saVED");
	            }
	            else {
	                console.log("Error: could not save lead " + lead.phone);
	            }
	        });
	        
	    }
	});
}