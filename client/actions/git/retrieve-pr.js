var exec = require('child_process').exec;
var log = require('../../logger.js').log;
var config = require('../../config/config.js');

function RetrievePR(task) {
	var clone_url = task.clone_url;
	var pr_dir = "/tmp/evans/" + task.id + "/";

	var process = {
		directory : pr_dir,
		command : "/bin/bash -c 'mkdir -p "+pr_dir+" && cd "+pr_dir+" && git clone "+clone_url+" . --depth=1 -b "+task.branch+" && git config user.name \""+config.GitHub.name+"\" && git config user.email \""+config.GitHub.email+"\"'",
		branch : task.branch,
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

module.exports = RetrievePR;
