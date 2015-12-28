var exec = require('child_process').exec;

function RetrieveBuildNumber(wd) {

	var process = {
		command : "/bin/bash -c 'cd "+wd+" && agvtool what-version -terse'",
		buildNumber : 0,
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
				process.buildNumber = parseInt(process.log.trim());
				callbacks.forEach(function(callback){
					callback(err);
				})
			});
		}
	};

	return process;
}

module.exports = RetrieveBuildNumber;
