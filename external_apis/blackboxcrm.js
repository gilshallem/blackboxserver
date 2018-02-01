const Hubspot = require('hubspot');
const hubspot = new Hubspot({ apiKey: 'ae998e34-ec01-47b9-879f-da1e2c2af7fa' });


exports.notify = function (title,description,data,type,notify,callback) {
	callback(0);
}

exports.addLead = function(ip,fname,lname,email,country,phone,countryCode,language,refCat,ref,callback) {
	hubspot.contacts.create({
		"properties": [
			{
				"property": "email",
				"value": email.trim()
			  },
			  {
				"property": "firstname",
				"value": fname.trim()
			  },
			  {
				"property": "lastname",
				"value": lname.trim()
			  },
			  {
				"property": "phone",
				"value": phone
			  },
			  {
				"property": "country",
				"value": country.trim()
			  }
		]

	}, function(err, resp, body) {
		if (err || resp.statusCode!=200) {
			callback(-1,err,phone);
		}
		else {
			callback(0,null,phone);
		}
	});

};


exports.addUser = function(ip,fname,lname,email,country,language,refCat,ref,callback) {
	hubspot.contacts.createOrUpdate(email.trim(),{
		"properties": [
			{
				"property": "email",
				"value": email.trim()
			  },
			  {
				"property": "firstname",
				"value": fname.trim()
			  },
			  {
				"property": "lastname",
				"value": lname.trim()
			  },
			  {
				"property": "phone",
				"value": phone
			  },
			  {
				"property": "country",
				"value": country.trim()
			  }
		]

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
	callback(0);
}

exports.updateAF = function(phone,compaign,media,agency,id,clickTime,installTime,siteId,fbAdGroup,fbAdSet,callback) {
	callback(0);
};

exports.signalStatistics = function(strategy,asset,signalTime,direction,power,bid,stopLoss,takeProfit,won,avgJump,tpPeriod,slPeriod,potentialSL,potentialTP,min5,min10,min15,max5,max10,max15,callback) {
	callback0();
};

exports.sendSignalStatistics = function (signal, callback) {
	callback(0);
}

exports.sendBrokerFeed = function(number,contacted , account , executed , rating , comments,callback) {
	callback(0);
};

exports.onShare = function(number,network ,userId, action , callback) {
	callback(0);
};

exports.brokermatch = function (phone,callback)  {
	callback(null,null,phone);
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
	callback(null,null,phone);
};

exports.getDetails = function (phone,callback)  {
	callback(null,null,phone);
};

exports.sendLead = function (phone,fname,lname,source,callback)  {

			callback(null,phone);

};


exports.sendExperienced = function (phone,callback)  { 
	callback(0,null,phone);
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