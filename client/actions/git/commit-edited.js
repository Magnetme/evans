var exec = require('child_process').exec;
var log = require('../../logger.js').log;

function Process(wd, errorCallback) {
	var process = {
		name : 'GitCommit',
		command : "/bin/bash -c 'cd "+wd+" && git commit -asm \"",
		log : '',
		error : null,
		successCheck : function(err, stdout, stderr) {
			if(process.log.indexOf('insertions') > -1) {
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
		run : function(callbacks, message) {
			var realcommand = this.command + message + "\"'";
			exec(realcommand, function(err, stdout, stderr) {
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
