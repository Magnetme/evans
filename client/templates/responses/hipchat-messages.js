var BuildMessage = require('./HipChat/build-message.js');
var DeployMessage = require('./HipChat/deploy-message.js');
var TestFlightMessage = require('./HipChat/testflight-message.js');

var Messages = {
	BuildMessage : BuildMessage,
	DeployMessage: DeployMessage,
	TestFlightMessage: TestFlightMessage
};

module.exports = Messages;
