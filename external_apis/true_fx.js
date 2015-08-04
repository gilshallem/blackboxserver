var http = require('http');

var USERNAME = 'gilsh';
var PASSWORD = 'blackbox1999';
var QUALIFIER = 'bbserver';
var PATH = "/rates/connect.html";

var ALL_CORRENCIES = 'EUR/USD,USD/JPY,GBP/USD,EUR/GBP,USD/CHF,EUR/JPY,EUR/CHF,USD/CAD,AUD/USD,GBP/JPY,AUD/CAD,AUD/CHF,AUD/JPY,AUD/NZD,CAD/CHF,CHF/JPY,EUR/AUD,EUR/CAD,EUR/NOK,EUR/NZD,GBP/CAD,GBP/CHF,NZD/JPY,NZD/USD,USD/NOK,USD/SEK';

var options = {
		host: 'webrates.truefx.com',
		port: 80,
		path: PATH
};

var sessionId=null;

exports.getCurrencyUpdates = getUpdates;

exports.getCurrencies = function() {return ALL_CORRENCIES.split(",");};

function getUpdates(onUpdate,onError) {
	if (sessionId==null) {
		console.log("Login in into TrueFx");
		options.path = PATH + "?s=n&f=csv&u=" + USERNAME + "&p=" + PASSWORD + "&q=" + QUALIFIER + "&c=" + ALL_CORRENCIES;


		http.get(options, function(resp){
			var outData="";
			resp.on('data', function(chunk){
				outData+=chunk;
			});
			resp.on('end', function () {
				sessionId = outData;
				sessionId = sessionId.replace(/(\r\n|\n|\r)/gm,"");
				//console.log("Logined into TrueFx sessionID=" + sessionId);
				getUpdates(onUpdate);
			});

		}).on("error", function(e){
			onError(e.message);
			console.log("Got error: " + e.message);
		});
	}
	else {
		//console.log("Getting data from TrueFx");
	    options.path = PATH + "?id=" + sessionId + "&f=csv&c=" + ALL_CORRENCIES;

		http.get(options, function(resp){
			var outData="";
			resp.on('data', function(chunk){
				outData+=chunk;
			});
			resp.on('end', function () {
				//console.log("Got data from TrueFx ");
				onUpdate(CSVToArray(outData));
			});
		}).on("error", function(e){
			onError(e.message);
			console.log("Got error: " + e.message);
		});
	}
}




//This will parse a delimited string into an array of
//arrays. The default delimiter is the comma, but this
//can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    
//	Check to see if the delimiter is defined. If not,
//	then default to comma.
	strDelimiter = (strDelimiter || ",");

//	Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
			(
//					Delimiters.
					"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

//					Quoted fields.
					"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

//					Standard fields.
					"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			"gi"
	);


//	Create an array to hold our data. Give the array
//	a default empty first row.
	var arrData = [[]];

//	Create an array to hold our individual pattern
//	matching groups.
	var arrMatches = null;


//	Keep looping over the regular expression matches
//	until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){

//		Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];

//		Check to see if the given delimiter has a length
//		(is not the start of string) and if it matches
//		field delimiter. If id does not, then we know
//		that this delimiter is a row delimiter.
		if (
				strMatchedDelimiter.length &&
				(strMatchedDelimiter != strDelimiter)
		){

//			Since we have reached a new row of data,
//			add an empty row to our data array.
			arrData.push( [] );

		}


//		Now that we have our delimiter out of the way,
//		let's check to see which kind of value we
//		captured (quoted or unquoted).
		if (arrMatches[ 2 ]){

//			We found a quoted value. When we capture
//			this value, unescape any double quotes.
			var strMatchedValue = arrMatches[ 2 ].replace(
					new RegExp( "\"\"", "g" ),
					"\""
			);

		} else {

//			We found a non-quoted value.
			var strMatchedValue = arrMatches[ 3 ];

		}


//		Now that we have our value string, let's add
//		it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

//	Return the parsed data.
	return( arrData );
}