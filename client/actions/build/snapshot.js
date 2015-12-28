var exec = require('child_process').exec;
var log = require('../../logger.js').log;

function Snapshot(wd) {
	var snapshot = {
		command : "/bin/bash -c 'cd " + wd + " && snapshot | strip-ansi'",
		log : "",
		error : "",
		run : function(callbacks) {
			exec(this.command, function(err, stdout, stderr) {
				if (err) {
					snapshot.error = err;
				}
				if(stderr){
					snapshot.log += stderr;
				}
				if(stdout){
					snapshot.log += stdout;
				}
				snapshot.log = snapshot.log.replace(/```/g, "");
				log.verbose(snapshot.log);

				callbacks.forEach(function(callback){
					callback(err);
				})
			});
		}
	};

	return snapshot;
}

module.exports = Snapshot;
