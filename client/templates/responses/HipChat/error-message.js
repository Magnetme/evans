var config = require('../../../config/config.js');

function ErrorMessage(message) {
	var hipChatMessage = {
		message : "<strong>(" + config.Evans.client_name + ") Error:</strong> " + message,
		color: "red",
		from: "Evans",
		message_format: "html"
	};

	return hipChatMessage;
}

module.exports = ErrorMessage;
