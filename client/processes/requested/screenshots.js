var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var github = require('../../clients/github/github.js');
var s3 = require('../../clients/s3/s3.js');
var log = require('../../logger.js').log;
var fs = require('fs');

var Screenshots = {
	start : function(task, successCallback) {
		log.verbose('Screenshots requested.');

		log.verbose('Configuring screenshot process.');

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
		var snapshot        = new Actions.Snapshot(retrieveBranch.directory, postErrorOnHipChat);
		var killSimulator   = new Actions.Processes.Kill('Simulator');

		log.verbose('Launching screenshot processes.');

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
				var hipMessage = HipChatMessages.BuildMessage("Generating screenshots...");
				hipchat.sendMessage(hipMessage, callback);
			},
			function(callback) {
				snapshot.run([function (err) {
					if (err) {
						log.error("Error occurred: %s", err);
					}
				}, function(err){
					var hipMessage = HipChatMessages.BuildMessage("Screenshot were generated successfully.");
					hipchat.sendMessage(hipMessage, null);
				}, function(err){
					var params = {
						localDir: retrieveBranch.directory + "fastlane/screenshots/",
						deleteRemoved: true,
						s3Params: {
							Bucket: 'evans-ios.magnet.me',
							Prefix: 'screenshots/' + task.id + "/",
							ACL: 'public-read'
						}
					};
					var uploader = s3.uploadDir(params);
					uploader.on('error', function(err) {
						var hipMessage = HipChatMessages.ErrorMessage("S3 Unable to sync:" + err.stack);
						hipchat.sendMessage(hipMessage, null);
					});
					uploader.on('progress', function() {
						log.verbose("Progress: %s \%", parseInt((uploader.progressAmount/uploader.progressTotal)*100));
					});
					uploader.on('end', function() {
						var hipMessage = HipChatMessages.BuildMessage("S3 successfully synced, view screenshots \<a href\=\'https://s3-eu-west-1.amazonaws.com/evans-ios.magnet.me/screenshots/" + task.id +"\/screenshots\.html\'\>here\</a\>.");
						hipchat.sendMessage(hipMessage, null);
						callback()
					});
				}]);
			}, function(callback) {
				killSimulator.run([callback]);
			}, function(callback) {
				successCallback();
				callback()
			}
		]);
	}
};

module.exports = Screenshots;