function BuildMessage(message) {
	var buildMessage = {
		message : "<strong>Evans:</strong> " + message,
		color: "gray",
		notify: false,
		message_format: "html"
	};

	return buildMessage;
}

module.exports = BuildMessage;
