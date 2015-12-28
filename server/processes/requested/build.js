var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var GitHubResponses = require('../../templates/responses/github-responses.js');
var github = require('../../clients/github/github.js');
var log = require('../../logger.js').log;

var Build = {
	start : function(payload) {
		log.verbose('Build requested.')
		var pr_nr = payload.issue.number;
		var comment = payload.comment;
		var pr_link = "<a href='https://github.com/Magnetme/ios/pull/"+ pr_nr + "'>#"+pr_nr+"</a>";

		var hipMessage = HipChatMessages.BuildMessage("("+pr_link+") Build started by comment <a href='" + comment.html_url + "'>" + comment.id +"</a>.");
		hipchat.sendMessage(hipMessage);

		log.verbose('Configuring build process.');

		var retrieveBranch  = new Actions.RetrievePR(payload);
		var cocoapods       = new Actions.CocoaPods(retrieveBranch.directory);
		var gym             = new Actions.Gym(retrieveBranch.directory);

		log.verbose('Launching build processes.');

		async.series([
			function(callback) {
				retrieveBranch.run([function (err) {
					github.issues.createComment(GitHubResponses.BuildStatus(payload, "**Branch retrieved!**"), function (err, res) {
						if (err) {
							log.error("Error occurred while creating an issue comment: %s", err);
						}
					});
				}, function(err){
					var hipMessage = HipChatMessages.BuildMessage("("+pr_link+") Branch retrieved.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				cocoapods.run([function (err) {
					github.issues.createComment(GitHubResponses.BuildStatus(payload, "**CocoaPods Log:** \n```\n" + cocoapods.log + "```"), function (err, res) {
						if (err) {
							log.error("Error occurred while creating an issue comment: %s", err);
						}
					});
				}, function(err){
					var hipMessage = HipChatMessages.BuildMessage("("+pr_link+") CocoaPods installed.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				gym.run([function (err) {
					github.issues.createComment(GitHubResponses.BuildStatus(payload, "**Gym Log:** \n```\n" + gym.log + "```"), function (err, res) {
						if (err) {
							log.error("Error occurred while creating an issue comment: %s", err);
						}
					});
				}, function(err){
					var hipMessage = HipChatMessages.BuildMessage("("+pr_link+") Build Successful!");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			}
		]);
	}
};

module.exports = Build;