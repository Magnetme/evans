var exec = require('child_process').exec;
var log = require('../../logger.js').log;

function Process(name) {
	var process = {
		name : 'Kill',
		command : "/bin/bash -c 'killall "+name+"'",
		log : '',
		error : null,
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

				callbacks.forEach(function(callback) {
					callback(err);
				});
			});
		}
	};
	return process;
}

module.exports = Process;
