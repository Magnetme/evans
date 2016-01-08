var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var github = require('../../clients/github/github.js');
var s3 = require('../../clients/s3/s3.js');
var log = require('../../logger.js').log;
var fs = require('fs');

var Build = {
	start : function(task, successCallback) {
		log.verbose('Build requested.');

		var hipMessage = HipChatMessages.BuildMessage("Build started");
		hipchat.sendMessage(hipMessage);

		log.verbose('Configuring build process.');

		var postErrorOnHipChat = function(processName, errorLogs) {
			var logFileName = "task-"+task.id+"-"+processName+".log";
			var logFilePath = "/tmp/" + logFileName;
			fs.writeFile(logFilePath, errorLogs, function(err) {
				if(err) {
					log.error('There was a problem writing the error logfile to /tmp.');
				}
			});

			var params = {
				localFile: "/tmp/task-"+task.id+"-"+processName+".log",
				deleteRemoved: true,
				s3Params: {
					Bucket: 'evans-ios.magnet.me',
					Key: 'logs/' + task.id + "/" + logFileName,
					ACL: 'public-read'
				}
			};
			var uploader = s3.uploadFile(params);
			uploader.on('error', function(err) {
				var hipMessage = HipChatMessages.ErrorMessage("S3 Unable to sync: " + err.stack);
				hipchat.sendMessage(hipMessage);
			});
			uploader.on('progress', function() {
				log.verbose("Progress: %s \%", parseInt((uploader.progressAmount/uploader.progressTotal)*100));
			});
			uploader.on('end', function() {
				var hipMessage = HipChatMessages.ErrorMessage("The process <i>" + processName + "</i> encountered an error. \<a href\=\'https://s3-eu-west-1.amazonaws.com/evans-ios.magnet.me/logs/" + task.id +"\/"+logFileName+"\'\>View Log\</a\>.");
				hipchat.sendMessage(hipMessage, null);
			});
		};

		var retrieveBranch  = new Actions.RetrievePR(task, postErrorOnHipChat);
		var cocoapods       = new Actions.CocoaPods(retrieveBranch.directory, postErrorOnHipChat);
		var gym             = new Actions.Gym(retrieveBranch.directory, postErrorOnHipChat);

		log.verbose('Launching build processes.');

		async.series([
			function(callback) {
				var hipMessage = HipChatMessages.BuildMessage("Retrieving branch...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				retrieveBranch.run([function(err){
					var hipMessage = HipChatMessages.BuildMessage("Branch retrieved.");
					hipchat.sendMessage(hipMessage, callback);
				}]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.BuildMessage("Installing CocoaPods...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				cocoapods.run([function(err){
					var hipMessage = HipChatMessages.BuildMessage("CocoaPods installed.");
					hipchat.sendMessage(hipMessage, callback);
				}]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.BuildMessage("Building with gym...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				gym.run([function(err){
					var hipMessage = HipChatMessages.BuildMessage("Gym Build Successful!");
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

module.exports = Build;