var exec = require('child_process').exec;

function CommitEditedFiles(wd, message) {

	var process = {
		command : "/bin/bash -c 'cd "+wd+" && git commit -asm \'"+message+"\''",
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
				callbacks.forEach(function(callback){
					callback(err);
				})
			});
		}
	};

	return process;
}

module.exports = CommitEditedFiles;