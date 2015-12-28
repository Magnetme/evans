var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var github = require('../../clients/github/github.js');
var log = require('../../logger.js').log;

var Build = {
	start : function(task, successCallback) {
		log.verbose('Build requested.');
		//var pr_nr = payload.issue.number;
		//var comment = payload.comment;
		//var pr_link = "<a href='https://github.com/Magnetme/ios/pull/"+ pr_nr + "'>#"+pr_nr+"</a>";

		var hipMessage = HipChatMessages.BuildMessage("Build started");
		hipchat.sendMessage(hipMessage);

		log.verbose('Configuring build process.');

		var retrieveBranch  = new Actions.RetrievePR(task);
		var cocoapods       = new Actions.CocoaPods(retrieveBranch.directory);
		var gym             = new Actions.Gym(retrieveBranch.directory);

		log.verbose('Launching build processes.');

		async.series([
			function(callback) {
				retrieveBranch.run([function(err){
					var hipMessage = HipChatMessages.BuildMessage("Branch retrieved.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				cocoapods.run([function(err){
					var hipMessage = HipChatMessages.BuildMessage("CocoaPods installed.");
					hipchat.sendMessage(hipMessage);
				}, callback]);
			},
			function(callback) {
				gym.run([function(err){
					var hipMessage = HipChatMessages.BuildMessage("Build Successful!");
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