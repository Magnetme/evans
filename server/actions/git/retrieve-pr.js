var exec = require('child_process').exec;

function RetrievePR(payload) {
	var repo_url = payload.repository.ssh_url;
	var pr_nr = payload.issue.number;
	var pr_dir = "/tmp/evans/"+pr_nr+"/" + payload.comment.id + "/";

	var process = {
		directory : pr_dir,
		command : "/bin/bash -c 'mkdir -p "+pr_dir+" && cd "+pr_dir+" && git clone " + repo_url + " . --depth=1 -b ",
		log : "",
		error : "",
		run : function(callbacks, branch) {
			exec(this.command + branch + "'", function(err, stdout, stderr) {
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

module.exports = RetrievePR;
