var exec = require('child_process').exec;
var log = require('../../logger.js').log;
var config = require('../../config/config.js');

function Process(task, errorCallback) {
	var clone_url = task.clone_url;
	var pr_dir = "/tmp/evans/" + task.id + "/";

	var process = {
		name: 'RetrievePR',
		directory : pr_dir,
		command : "/bin/bash -c 'mkdir -p "+pr_dir+" && cd "+pr_dir+" && git clone "+clone_url+" . --depth=1 -b "+task.branch+" && git config user.name \""+config.GitHub.name+"\" && git config user.email \""+config.GitHub.email+"\"'",
		branch : task.branch,
		log : '',
		error : null,
		successCheck : function(err, stdout, stderr) {
			if(process.log.indexOf('Cloning into') > -1) {
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
			log.info(process.command);
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