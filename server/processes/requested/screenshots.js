var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var GitHubResponses = require('../../templates/responses/github-responses.js');
var github = require('../../clients/github/github.js');
var s3 = require('../../clients/s3/s3.js');
var log = require('../../logger.js').log;

var Screenshots = {
	start : function(payload) {
		log.verbose('Screenshots requested.')
		var pr_nr = payload.issue.number;
		var comment = payload.comment;
		var pr_link = "<a href='https://github.com/Magnetme/ios/pull/"+ pr_nr + "'>#"+pr_nr+"</a>";

		log.verbose('Configuring build process.');

		var retrieveBranch  = new Actions.RetrievePR(payload);
		var cocoapods       = new Actions.CocoaPods(retrieveBranch.directory);
		var snapshot        = new Actions.Snapshot(retrieveBranch.directory);

		log.verbose('Launching build processes.');

		async.series([
			function(callback) {
				retrieveBranch.run([function (err) {
					github.issues.createComment(GitHubResponses.BuildStatus(payload, "**Branch retrieved!**"), function (err, res) {
						if (err) {
							log.error("Error occurred while creating an issue comment: %s", err);
						}
					});
				}, callback]);
			},
			function(callback) {
				cocoapods.run([function (err) {
					github.issues.createComment(GitHubResponses.BuildStatus(payload, "**CocoaPods Log:** \n```" + cocoapods.log + "```"), function (err, res) {
						if (err) {
							log.error("Error occurred while creating an issue comment: %s", err);
						}
					});
				}, callback]);
			},
			function(callback) {
				snapshot.run([function (err) {
					github.issues.createComment(GitHubResponses.BuildStatus(payload, "**Snapshot Log:** \n```\n" + snapshot.log + "```"), function (err, res) {
						if (err) {
							log.error("Error occurred while creating an issue comment: %s", err);
						}
					});
				}, function(err){
					var hipMessage = HipChatMessages.BuildMessage("("+pr_link+") Screenshot were generated successfully.");
					hipchat.sendMessage(hipMessage);
				}, function(err){
					var params = {
						localDir: retrieveBranch.directory + "fastlane/screenshots/",
						deleteRemoved: true,
						s3Params: {
							Bucket: 'evans-ios.magnet.me',
							Prefix: 'screenshots/' + comment.id + "/",
							ACL: 'public-read'
						}
					};
					var uploader = s3.uploadDir(params);
					uploader.on('error', function(err) {
						var hipMessage = HipChatMessages.BuildMessage("("+pr_link+") S3 Unable to sync:" + err.stack);
						hipchat.sendMessage(hipMessage);
					});
					uploader.on('progress', function() {
						log.verbose("Progress: %s \%", parseInt((uploader.progressAmount/uploader.progressTotal)*100));
					});
					uploader.on('end', function() {
						var hipMessage = HipChatMessages.BuildMessage("("+pr_link+") S3 successfully synced, view screenshots <a href='https://s3-eu-west-1.amazonaws.com/evans-ios.magnet.me/screenshots/"+ comment.id  +"/screenshots.html'>here</a>.");
						hipchat.sendMessage(hipMessage);
					});
				}, callback]);
			}
		]);
	}
};

module.exports = Screenshots;