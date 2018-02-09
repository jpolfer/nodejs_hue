var hue = require("node-hue-api")

var displayBridges = function(bridge) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridge));
};

hue.nupnpSearch().then(displayBridges).done();


