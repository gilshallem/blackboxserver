function parsePhone(phoneNumber, countryCode) {

	try {
	
		var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
		var ISO = findCountryISO2(phoneNumber);
		var regionCode = phoneUtil.getRegionCodeForCountryCode(ISO);
		var number = phoneUtil.parseAndKeepRawInput("+" + phoneNumber, regionCode);

		var areaCode = null;
		var countryCode=null;
		var nationalSignificantNumber = phoneUtil.getNationalSignificantNumber(number);
		var nationalDestinationCodeLength =    phoneUtil.getLengthOfNationalDestinationCode(number);

		if (nationalDestinationCodeLength > 0) {
			areaCode = nationalSignificantNumber.substring(0,  nationalDestinationCodeLength);
			
		}
		countryCode = phoneNumber.substr(0,phoneNumber.indexOf(nationalSignificantNumber));
		var cleanNumber = nationalSignificantNumber.substr(areaCode.length);
		return {
			countryCode: countryCode,
			areaCode:areaCode,
			number:cleanNumber,
			countryISOCode:ISO
			
		
		}
	}
		catch(ex) {
		console.log(ex);
	}

	return null;
};

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}