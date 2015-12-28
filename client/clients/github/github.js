var githubAPI = require("github");
var config = require('../../config/config.js');

var GitHub = new githubAPI({
	version : "3.0.0",
	debug : true,
	protocol : "https",
	host : "api.github.com",
	timeout : 5000,
	headers : {
		"user-agent" : "Evans"
	}
});

GitHub.authenticate({
	type : "token",
	token : config.GitHubAPI.token
});

module.exports = GitHub;