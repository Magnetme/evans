var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var github = require('../../clients/github/github.js');
var log = require('../../logger.js').log;

var deployment = {
	start : function(payload) {
		log.verbose('TestFlight submission requested.');
		var pr_nr = payload.issue.number;
		var pr_link = "<a href='https://github.com/Magnetme/ios/pull/"+ pr_nr + "'>#"+pr_nr+"</a>";

		var hipMessage = HipChatMessages.DeployMessage("("+pr_link+") Pull request merged into master. Starting new deployment.");
		hipchat.sendMessage(hipMessage);

		log.verbose('Configuring build process.');

		var branchName = "master";

		var retrieveBranch  = new Actions.RetrievePR(payload);
		var retrieveBuild   = new Actions.Metadata.RetrieveBuildNumber(retrieveBranch.directory);
		var increaseBuild   = new Actions.Metadata.InreaseBuildNumber(retrieveBranch.directory);
		var commitEdited    = new Actions.Git.CommitEditedFiles(retrieveBranch.directory);
		var push            = new Actions.Git.Push(retrieveBranch.directory);
		var cocoapods       = new Actions.CocoaPods(retrieveBranch.directory);
		var gym             = new Actions.Gym(retrieveBranch.directory);
		var pilot           = new Actions.Pilot(retrieveBranch.directory);

		log.verbose('Launching build processes.');

		async.series([
			function(callback) {
				github.repos.getBranch({user: 'Magnetme', repo:'ios',branch: 'master'}, function (err,res) {
					var commitMessage = res.commit.commit.message.replace(/(\r\n|\n|\r)/gm, " ");
					var hipMessage = HipChatMessages.DeployMessage(commitMessage);
					hipchat.sendMessage(hipMessage);
					callback(err);
				});
			},
			function(callback) {
				retrieveBranch.run([function(err){
					var hipMessage = HipChatMessages.DeployMessage("("+pr_link+") Master branch retrieved.");
					hipchat.sendMessage(hipMessage);
				}, callback], branchName);
			},
			function(callback) {
				retrieveBuild.run([function (err) {
				}, function(err){
					var hipMessage = HipChatMessages.DeployMessage("("+pr_link+") Detected build number "+retrieveBuild.buildNumber+".");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				increaseBuild.run([function(err){
					var hipMessage = HipChatMessages.DeployMessage("("+pr_link+") Increased build number.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				commitEdited.run([function(err){
					var hipMessage = HipChatMessages.DeployMessage("("+pr_link+") Commited new version.");
					hipchat.sendMessage(hipMessage);
				}, callback], "Magnet.me iOS: Build Number increased to: " + (retrieveBuild.buildNumber +1) + ".");
			},
			function(callback) {
				push.run([function(err){
					var hipMessage = HipChatMessages.DeployMessage("("+pr_link+") Pushed new version.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				cocoapods.run([function(err){
					var hipMessage = HipChatMessages.DeployMessage("("+pr_link+") CocoaPods installed.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				gym.run([function(err){
					var hipMessage = HipChatMessages.DeployMessage("("+pr_link+") Build Successful!");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				pilot.run([function(err){
					var hipMessage = HipChatMessages.DeployMessage("("+pr_link+") Uploaded a new version to TestFlight. Please release manually when done processing.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			}
		]);
	}
};

module.exports = deployment;