var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var github = require('../../clients/github/github.js');
var s3 = require('../../clients/s3/s3.js');
var log = require('../../logger.js').log;

var Screenshots = {
	start : function(payload, successCallback) {
		log.verbose('Screenshots requested.');

		log.verbose('Configuring screenshot process.');

		var retrieveBranch  = new Actions.RetrievePR(task);
		var cocoapods       = new Actions.CocoaPods(retrieveBranch.directory);
		var snapshot        = new Actions.Snapshot(retrieveBranch.directory);

		log.verbose('Launching screenshot processes.');

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
				snapshot.run([function (err) {
					if (err) {
						log.error("Error occurred: %s", err);
					}
				}, function(err){
					var hipMessage = HipChatMessages.BuildMessage("Screenshot were generated successfully.");
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
						var hipMessage = HipChatMessages.BuildMessage("S3 Unable to sync:" + err.stack);
						hipchat.sendMessage(hipMessage);
					});
					uploader.on('progress', function() {
						log.verbose("Progress: %s \%", parseInt((uploader.progressAmount/uploader.progressTotal)*100));
					});
					uploader.on('end', function() {
						var hipMessage = HipChatMessages.BuildMessage("S3 successfully synced, view screenshots \<a href\=\'https://s3-eu-west-1.amazonaws.com/evans-ios.magnet.me/screenshots/" + comment.id +"\/screenshots\.html\'\>here\</a\>.");
						hipchat.sendMessage(hipMessage);
						callback()
					});
				}, function(callback) {
					successCallback();
					callback()
				}]);
			}
		]);
	}
};

module.exports = Screenshots;