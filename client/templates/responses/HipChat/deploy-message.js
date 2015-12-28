function DeployMessage(message) {
	var deployMessage = {
		message : "<strong>Magnet.me iOS (Deployment):</strong> " + message,
		color: "gray",
		notify: false,
		message_format: "html"
	};

	return deployMessage;
}

module.exports = DeployMessage;
