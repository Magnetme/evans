var BuildMessage = require('./HipChat/build-message.js');
var ErrorMessage = require('./HipChat/error-message.js');
var DeployMessage = require('./HipChat/deploy-message.js');
var TestFlightMessage = require('./HipChat/testflight-message.js');

var Messages = {
	BuildMessage : BuildMessage,
	ErrorMessage : ErrorMessage,
	DeployMessage: DeployMessage,
	TestFlightMessage: TestFlightMessage
};

module.exports = Messages;
