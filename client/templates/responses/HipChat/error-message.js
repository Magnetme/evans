function ErrorMessage(message) {
	var message = {
		message : "<strong>Evans:</strong> " + message,
		color: "red",
		notify: false,
		message_format: "html"
	};

	return message;
}

module.exports = ErrorMessage;
