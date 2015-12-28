var exec = require('child_process').exec;

function Gym(wd) {
	var gym = {
		command : "/bin/bash -c 'cd " + wd + " && gym -s \"magnet.me\" --silent | strip-ansi'",
		log : "",
		error : "",
		run : function(callbacks) {
			exec(this.command, function(err, stdout, stderr) {
				if (err) {
					gym.error = err;
				}
				if(stderr){
					gym.log += stderr;
				}
				if(stdout){
					gym.log += stdout;
				}

				callbacks.forEach(function(callback){
					callback(err);
				})
			});
		}
	};

	return gym;
}

module.exports = Gym;
