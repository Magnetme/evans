var exec = require('child_process').exec;
var log = require('../../logger.js').log;

function Pilot(wd) {
	var pilot = {
		command : "/bin/bash -c 'cd " + wd + "&& match appstore && pilot upload --skip_submission | strip-ansi'",
		log : "",
		error : "",
		run : function(callbacks) {
			exec(this.command, function(err, stdout, stderr) {
				if (err) {
					pilot.error = err;
				}
				if(stderr){
					pilot.log += stderr;
				}
				if(stdout){
					pilot.log += stdout;
				}
				pilot.log = pilot.log.replace(/```/g, "");
				log.verbose(pilot.log);

				callbacks.forEach(function(callback){
					callback(err);
				})
			});
		}
	};

	return pilot;
}

module.exports = Pilot;
