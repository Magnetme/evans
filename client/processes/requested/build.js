var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var github = require('../../clients/github/github.js');
var log = require('../../logger.js').log;

var Build = {
	start : function(task, successCallback) {
		log.verbose('Build requested.');

		var hipMessage = HipChatMessages.BuildMessage("Build started");
		hipchat.sendMessage(hipMessage);

		log.verbose('Configuring build process.');

		var retrieveBranch  = new Actions.RetrievePR(task);
		var cocoapods       = new Actions.CocoaPods(retrieveBranch.directory);
		var gym             = new Actions.Gym(retrieveBranch.directory);

		log.verbose('Launching build processes.');

		async.series([
			function(callback) {
				var hipMessage = HipChatMessages.BuildMessage("Retrieving branch...");
				hipchat.sendMessage(hipMessage);
				callback()
			},
			function(callback) {
				retrieveBranch.run([function(err){
					var hipMessage = HipChatMessages.BuildMessage("Branch retrieved.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.BuildMessage("Installing CocoaPods...");
				hipchat.sendMessage(hipMessage);
				callback()
			},
			function(callback) {
				cocoapods.run([function(err){
					var hipMessage = HipChatMessages.BuildMessage("CocoaPods installed.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.BuildMessage("Building with gym...");
				hipchat.sendMessage(hipMessage);
				callback()
			},
			function(callback) {
				gym.run([function(err){
					var hipMessage = HipChatMessages.BuildMessage("Gym Build Successful!");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				successCallback();
				callback()
			}
		]);
	}
};

module.exports = Build;