var exec = require('child_process').exec;
var log = require('../../logger.js').log;

function IncreaseBuildNumber(wd) {

	var process = {
		command : "/bin/bash -c 'cd "+wd+" && agvtool next-version -all'",
		log : "",
		error : "",
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
				log.verbose(process.log);
				callbacks.forEach(function(callback){
					callback(err);
				})
			});
		}
	};

	return process;
}

module.exports = IncreaseBuildNumber;
