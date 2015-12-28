var exec = require('child_process').exec;

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

				callbacks.forEach(function(callback){
					callback(err);
				})
			});
		}
	};

	return snapshot;
}

module.exports = Snapshot;
