var hue = require("node-hue-api");
var HueApi = hue.HueApi;
var lightState = hue.lightState;

var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

var host = "192.168.1.76",
    username = "s5le-cIUhAfl3VC77G7L5kOYKFFO8OqgKhh0MaEm",
    api;

var kelvinToMirek = function(kelvin) {
	return 1000000 / kelvin;
};

var mirekToKelvin = function(mirek) {
	return 1000000 / mirek;
};

var extractColorTempInfo = function(lightsResult)
{
	var ctInfo = [];
	var lights = lightsResult.lights;
	for(var i = 0; i < lights.length; i++)
	{
		ctInfo.push({
				"id": lights[i].id,
				"on": lights[i].state.on,
				"ct": lights[i].state.ct,
				"kelvin": Math.floor(mirekToKelvin(lights[i].state.ct))
			    });
	}

	return ctInfo;
};

var resetTempsBasedOnTimeOfDay = function(ctInfo) {
	var hour = new Date().getHours();
	var softWhiteMirek = Math.floor(kelvinToMirek(2700));
	var softWhiteState = lightState.create().ct(softWhiteMirek);

	if(hour >= 8)
	{	
		// Set all color temps to 2700k or below
		for(var i = 0; i< ctInfo.length; i++)
		{
			if(ctInfo[i].kelvin > 2700 && ctInfo[i].on == true)
			{
				api.setLightState(ctInfo[i].id, softWhiteState)
					.done();	
			}
			if(ctInfo[i].kelvin > 2700 && ctInfo[i].on == false)
			{
				api.setLightState(ctInfo[i].id, lightState.create().on())
					.done();
				api.setLightState(ctInfo[i].id, softWhiteState)
					.done();	
				pause(300);
				api.setLightState(ctInfo[i].id, lightState.create().off())
					.done();
			}
		}
	}

	return ctInfo;
		
}

api = new HueApi(host, username);

// pull all light color temperatures
api.lights()
	.then(extractColorTempInfo)
	.then(resetTempsBasedOnTimeOfDay)
	.then(displayResult)
	.done();
