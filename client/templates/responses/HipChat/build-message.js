var config = require('../../../config/config.js');

function BuildMessage(message) {
	var hipChatMessage = {
		message : "<strong>(" + config.Evans.client_name + ") Build:</strong> " + message,
		color: "gray",
		from: "Evans",
		message_format: "html"
	};

	return hipChatMessage;
}

module.exports = BuildMessage;
