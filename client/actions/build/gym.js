var exec = require('child_process').exec;
var log = require('../../logger.js').log;
var config = require('../../config/config.js').log;

function Process(wd, errorCallback) {
	var process = {
		name : 'Gym',
		command : "/bin/bash -c 'cd " + wd + " && match appstore --verbose && gym -s \"magnet.me\" --use_legacy_build_api --silent --codesigning_identity \""+config.Apple.codesigningIdentity+"\"| strip-ansi'",
		log : '',
		error : null,
		successCheck : function(err, stdout, stderr) {
			if(process.log.indexOf('Successfully exported and signed the ipa file') > -1) {
				log.verbose(process.log);
				log.info(process.name + ' completed successfully.');
				return true;
			} else {
				log.error('The process \'' + process.name + '\' encountered an error.');
				log.error('Log:\n' + process.log);
				errorCallback(process.name,process.log);
				return false;
			}
		},
		run : function(callbacks) {
			exec(this.command, function(err, stdout, stderr) {
				if (err) {
					process.error = err;
				}
				if(stderr){
					process.log += stderr;
				}
				if(stdout){
					process.log += stdout;
				}

				if (process.successCheck(err, stdout, stderr)) {
					if(callbacks){
						callbacks.forEach(function(callback){
							callback(err);
						});
					}
				}
			});
		}
	};
	return process;
}

module.exports = Process;
