function BuildStatus(payload, message) {
	var message = {
		user : "Magnetme",
		repo : "ios",
		number : payload.issue.number,
		body : message
	};

	return message;
}

module.exports = BuildStatus;
