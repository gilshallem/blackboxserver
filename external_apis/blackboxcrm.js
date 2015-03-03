var ACTION_URL = "https://blackboxcrm.herokuapp.com/api";
//ACTION_URL = "http://127.0.0.1:3000/api";
var needle = require('needle');


exports.notify = function (title,description,data,type,notify,callback) {
	needle.post(ACTION_URL, {
		action:"notify",
		"title":title,
		"description":description,
		"data":data,
		"type":type,
		"notify":notify 
	}, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,phone);
		}
		else {
			callback(0,null,phone);
		}
	});
}

exports.addLead = function(ip,fname,lname,email,country,phone,countryCode,language,refCat,ref,callback) {
	needle.post(ACTION_URL, {
		action:"upsert",
		model:"leads",
		"key:number:phone":phone.trim(),
		"field:text:countryCode":countryCode,
		"field:text:ip":ip.trim(),
		"field:text:fname":fname.trim(),
		"field:text:lname":lname.trim(),
		"field:text:email":email.trim(),
		"field:options:country":country.trim(),
		"field:options:language":language.trim(),
		"field:options:refferal_category" : refCat,
		"field:options:refferal" : ref
	}, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,phone);
		}
		else {
			callback(0,null,phone);
		}
	});
};


exports.updateSubscription = function(phone,orderID,callback) {
	var params = {
			action:"upsert",
			model:"leads",
			"key:number:phone":phone.trim(),
			"field:bool:is_subscribed":"true",
			"field:text:subscription_order:":orderID.trim()
		}
		
		needle.post(ACTION_URL, params, function(err, resp, body) {
			if (err || resp.statusCode!=200) {
				callback(-1,err,phone);
			}
			else {
				callback(0,null,phone);
			}
		});
}

exports.updateAF = function(phone,compaign,media,agency,id,clickTime,installTime,siteId,fbAdGroup,fbAdSet,callback) {
	var params = {
		action:"upsert",
		model:"leads",
		"key:number:phone":phone.trim(),
		"field:text:af_id":id.trim(),
	}
	if (compaign) 
		params["field:options:af_compaign"]=compaign.trim();
	if (media) 
		params["field:options:af_media"]=media.trim();
	if (agency) 
		params["field:options:af_agency"]=agency.trim();
	if (clickTime) 
		params["field:Date:af_clickTime"]=clickTime.trim();
	if (installTime) 
		params["field:Date:af_installTime"]=installTime.trim();
	if (siteId)
		params["field:text:af_siteId"]=siteId.trim();
	if (fbAdGroup)
		params["field:text:af_fb_adGroup"]=fbAdGroup.trim();
	if (fbAdSet)
		params["field:text:af_fb_adSet"]=fbAdSet.trim();
	needle.post(ACTION_URL, params, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,phone);
		}
		else {
			callback(0,null,phone);
		}
	});
};

exports.signalStatistics = function(strategy,asset,signalTime,direction,power,bid,stopLoss,takeProfit,won,avgJump,tpPeriod,slPeriod,potentialSL,potentialTP,min5,min10,min15,max5,max10,max15,callback) {
	var bidLength = bid.trim().length;
	
	var sigTime =new Date( parseInt(signalTime));
	var intervalTime = sigTime.getTime() - ((sigTime.getMinutes() % 5)*60000) - (sigTime.getSeconds()*1000+sigTime.getMilliseconds());
	var id = getHashCode(intervalTime + "" + strategy + asset+direction+power+bid+won);
	
	var params = {
		action:"upsert",
		model:"signals",
		"key:number:signalid":id,
		"field:options:strategy":strategy.trim(),
		"field:options:asset":asset.trim(),
		"field:date:signalTime":signalTime.trim(),
		"field:options:direction":direction.trim(),
		"field:number:power":power.trim(),
		"field:number:bid":bid.trim(),
		"field:number:stopLoss":cutString(stopLoss.trim(),bidLength),
		"field:number:takeProfit":cutString(takeProfit.trim(),bidLength),
		"field:bool:won":won,
		"field:number:avgJump":avgJump.trim()
	}
	if (tpPeriod) 
		params["field:number:tpPeriod"]=tpPeriod.trim();
	if (slPeriod) 
		params["field:number:slPeriod"]=slPeriod.trim();
	if (potentialSL) 
		params["field:number:potentialSL"]=cutString(potentialSL.trim(),bidLength);
	if (potentialTP) 
		params["field:number:potentialTP"]=cutString(potentialTP.trim(),bidLength);
	if (min5) 
		params["field:number:min5"]=cutString(min5.trim(),bidLength);
	if (min10) 
		params["field:number:min10"]=cutString(min10.trim(),bidLength);
	if (min15) 
		params["field:number:min15"]=cutString(min15.trim(),bidLength);
	if (max5) 
		params["field:number:max5"]=cutString(max5.trim(),bidLength);
	if (max10) 
		params["field:number:max10"]=cutString(max10.trim(),bidLength);
	if (max15) 
		params["field:number:max15"]=cutString(max15.trim(),bidLength);
	
	needle.post(ACTION_URL, params, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err);
		}
		else {
			callback(0,null);
		}
	});
};

exports.sendBrokerFeed = function(number,contacted , account , executed , rating , comments,callback) {
	needle.post(ACTION_URL, {
		action:"upsert",
		model:"leads",
		"key:number:phone":number,
		"field:bool:broker_contacted":contacted,
		"field:bool:broker_open_account":account,
		"field:bool:broker_executed_signals":executed,
		"field:float:broker_rating":rating,
		"field:text:broker_comments":comments
	}, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,number);
		}
		else {
			callback(0,null,number);
		}
	});
};

exports.onShare = function(number,network ,userId, action , callback) {
	var params = {
			action:"upsert",
			model:"leads",
			"key:number:phone":number

	};
	params["field:" + network.toLowerCase() + ":" + network.toLowerCase() + "_id"] = userId;
	needle.post(ACTION_URL,params , function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,number);
		}
		else {
			callback(0,null,number);
		}
	});
};

exports.brokermatch = function (phone,callback)  {
	needle.post(ACTION_URL, {
		action:"externalPlugin",
		plugin:"brokermatch",
		plugin_action:"brokermatch",
		phone:phone
	}, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(null,err ? err : body+"",phone);
		}
		else {
			callback(body,null,phone);
		}
	});
	/*needle.post(ACTION_URL, {
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
	});*/

};

exports.getBroker = function (phone,callback)  {
	needle.post(ACTION_URL, {
		action:"externalPlugin",
		plugin:"brokermatch",
		plugin_action:"getBroker",
		phone:phone
	}, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(null,err ? err : body+"",phone);
		}
		else {
			callback(body,null,phone);
		}
	});
};


exports.sendExperienced = function (phone,callback)  { 
	needle.post(ACTION_URL, {
		action:"upsert",
		model:"leads",
		"key:number:phone":phone,
		"field:bool:experienced":true
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

function cutString(str,maxLength) {
	if (str && str.length>maxLength) return str.substring(0,maxLength);
	return str;
}

function getHashCode(s){
	  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
	}