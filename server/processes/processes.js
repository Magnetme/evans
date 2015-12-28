var deployment  = require('./automated/deployment.js');

var build       = require('./requested/build.js');
var screenshots = require('./requested/screenshots.js');
var testflight = require('./requested/testflight.js');

var Processes = {
	Automated: {
		deployment : deployment
	},
	Requested: {
		build: build,
		testflight: testflight,
		screenshots: screenshots
	}
};

module.exports = Processes;
