function DeployMessage(message) {
	var deployMessage = {
		message : "<strong>Evans (Deployment):</strong> " + message,
		color: "gray",
		notify: false,
		message_format: "html"
	};

	return deployMessage;
}

module.exports = DeployMessage;
