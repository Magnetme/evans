var config = require('../../../config/config.js');

function DeployMessage(message) {
	var hipChatMessage = {
		message : "<strong>(" + config.Evans.client_name + ") Deployment:</strong> " + message,
		color: "gray",
		from: "Evans",
		message_format: "html"
	};

	return hipChatMessage;
}

module.exports = DeployMessage;
