function TestFlightMessage(message) {
	var hipChatMessage = {
		message : "<strong>Magnet.me iOS (TestFlight):</strong> " + message,
		color: "purple",
		notify: false,
		message_format: "html"
	};

	return hipChatMessage;
}

module.exports = TestFlightMessage;
