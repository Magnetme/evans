var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var github = require('../../clients/github/github.js');
var log = require('../../logger.js').log;

var TestFlight = {
	start : function(task, successCallback) {
		log.verbose('TestFlight submission requested.');

		var hipMessage = HipChatMessages.TestFlightMessage("TestFlight Build started");
		hipchat.sendMessage(hipMessage);

		log.verbose('Configuring testflight process.');

		var retrieveBranch  = new Actions.RetrievePR(task);
		var retrieveBuild   = new Actions.Metadata.RetrieveBuildNumber(retrieveBranch.directory);
		var increaseBuild   = new Actions.Metadata.InreaseBuildNumber(retrieveBranch.directory);
		var commitEdited    = new Actions.Git.CommitEditedFiles(retrieveBranch.directory);
		var push            = new Actions.Git.Push(retrieveBranch.directory);
		var cocoapods       = new Actions.CocoaPods(retrieveBranch.directory);
		var gym             = new Actions.Gym(retrieveBranch.directory);
		var pilot           = new Actions.Pilot(retrieveBranch.directory);

		log.verbose('Launching testflight processes.');

		async.series([
			function(callback) {
				var hipMessage = HipChatMessages.TestFlightMessage("Retrieving Branch...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				retrieveBranch.run([function(err){
					var hipMessage = HipChatMessages.TestFlightMessage("Branch retrieved.");
					hipchat.sendMessage(hipMessage, callback);
				}], task.branch);
			},
			function(callback) {
				var hipMessage = HipChatMessages.TestFlightMessage("Retrieving Build Number...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				retrieveBuild.run([function (err) {
				}, function(err){
					var hipMessage = HipChatMessages.TestFlightMessage("Detected build number "+retrieveBuild.buildNumber+".");
					hipchat.sendMessage(hipMessage, callback);
				}]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.TestFlightMessage("Increasing Build Number...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				increaseBuild.run([function(err){
					var hipMessage = HipChatMessages.TestFlightMessage("Increased build number.");
					hipchat.sendMessage(hipMessage, callback);
				}]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.TestFlightMessage("Commiting new version...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				commitEdited.run([function(err){
					var hipMessage = HipChatMessages.TestFlightMessage("Commited new version.");
					hipchat.sendMessage(hipMessage, callback);
				}], "Magnet.me iOS: Build Number increased to: " + (retrieveBuild.buildNumber +1) + ".");
			},
			function(callback) {
				var hipMessage = HipChatMessages.TestFlightMessage("Pushing new version...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				push.run([function(err){
					var hipMessage = HipChatMessages.TestFlightMessage("Pushed new version.");
					hipchat.sendMessage(hipMessage, callback);
				}]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.TestFlightMessage("Installing CocoaPods...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				cocoapods.run([function(err){
					var hipMessage = HipChatMessages.TestFlightMessage("CocoaPods installed.");
					hipchat.sendMessage(hipMessage, callback);
				}]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.TestFlightMessage("Building with gym...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				gym.run([function(err){
					var hipMessage = HipChatMessages.TestFlightMessage("Gym Build Successful!");
					hipchat.sendMessage(hipMessage, callback);
				}]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.TestFlightMessage("Uploading new version to TestFlight...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				pilot.run([function(err){
					var hipMessage = HipChatMessages.TestFlightMessage("Uploaded a new version to TestFlight. Please release manually when done processing.");
					hipchat.sendMessage(hipMessage, callback);
				}]);
			},
			function(callback) {
				successCallback();
				callback()
			}
		]);
	}
};

module.exports = TestFlight;