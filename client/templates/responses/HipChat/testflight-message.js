var config = require('../../../config/config.js');

function TestFlightMessage(message) {
	var hipChatMessage = {
		message : "<strong>(" + config.Evans.client_name + ") TestFlight:</strong> " + message,
		color: "purple",
		from: "Evans",
		message_format: "html"
	};

	return hipChatMessage;
}

module.exports = TestFlightMessage;
