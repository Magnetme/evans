var async = require('async');

var Actions = require('../../actions/actions.js');
var HipChatMessages = require('../../templates/responses/hipchat-messages.js');
var hipchat = require('../../clients/hipchat/hipchat.js')();
var github = require('../../clients/github/github.js');
var s3 = require('../../clients/s3/s3.js');
var log = require('../../logger.js').log;
var fs = require('fs');

var TestFlight = {
	start : function(task, successCallback) {
		log.verbose('TestFlight submission requested.');

		var hipMessage = HipChatMessages.TestFlightMessage("TestFlight Build started");
		hipchat.sendMessage(hipMessage);

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

		log.verbose('Configuring testflight process.');

		var retrieveBranch  = new Actions.RetrievePR(task,postErrorOnHipChat);
		var retrieveBuild   = new Actions.Metadata.RetrieveBuildNumber(retrieveBranch.directory,postErrorOnHipChat);
		var increaseBuild   = new Actions.Metadata.InreaseBuildNumber(retrieveBranch.directory,postErrorOnHipChat);
		var commitEdited    = new Actions.Git.CommitEditedFiles(retrieveBranch.directory,postErrorOnHipChat);
		var push            = new Actions.Git.Push(retrieveBranch.directory,postErrorOnHipChat);
		var cocoapods       = new Actions.CocoaPods(retrieveBranch.directory,postErrorOnHipChat);
		var gym             = new Actions.Gym(retrieveBranch.directory,postErrorOnHipChat);
		var pilot           = new Actions.Pilot(retrieveBranch.directory,postErrorOnHipChat);

		log.verbose('Launching testflight processes.');

		var releaseId = 0;
		var newBuildNumber = 0;

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
					newBuildNumber = retrieveBuild.buildNumber + 1;
					hipchat.sendMessage(hipMessage, callback);
				}]);
			},
			function(callback) {
				var hipMessage = HipChatMessages.TestFlightMessage("Increasing build number...");
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
				}], "Magnet.me iOS: Build Number increased to: " + newBuildNumber + ".");
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
				github.releases.createRelease({
					owner: 'Magnetme',
					repo: 'ios',
					tag_name: ''+newBuildNumber,
					tag_commitish: ''+task.branch,
					name: 'Build ' + newBuildNumber,
					body: 'Auto-generated build by Evans.',
					prerelease: true
				}, function(err, result) {
					if(err){
						var hipMessage = HipChatMessages.ErrorMessage("Was unable to create a release on GitHub. <br/> <code>"+err+"</code>");
						hipchat.sendMessage(hipMessage, null);
					} else {
						var hipMessage = HipChatMessages.TestFlightMessage("New pre-release available on GitHub. \<a href\=\'"+ result['html_url'] +"\'\>View release\</a\>");
						hipchat.sendMessage(hipMessage, null);
						releaseId = result['id'];
					}
					callback()
				});
			},
			function(callback) {
				github.releases.uploadAsset({
					owner: 'Magnetme',
					repo: 'ios',
					id: releaseId,
					name: 'magnet.me.ipa',
					filePath: retrieveBranch.directory + 'magnet.me.ipa'
				}, function(err, result) {
					if(err){
						var hipMessage = HipChatMessages.ErrorMessage("Was unable attach asset to release on GitHub. <br/> <code>"+err+"</code>");
						hipchat.sendMessage(hipMessage, null);
					} else {
						var hipMessage = HipChatMessages.TestFlightMessage("Attached IPA asset to release on GitHub.");
						hipchat.sendMessage(hipMessage, null);
					}
					callback()
				});
			},
			function(callback) {
				successCallback();
				callback()
			}
		]);
	}
};

module.exports = TestFlight;