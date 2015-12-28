var exec = require('child_process').exec;

function RetrieveMaster(payload) {
	var repo_url = payload.repository.ssh_url;
	var pr_dir = "/tmp/evans/master/" + payload.head.sha + "/";

	var process = {
		directory : pr_dir,
		command : "/bin/bash -c 'mkdir -p "+pr_dir+" && cd "+pr_dir+" && git clone " + repo_url + " --depth=1 . && git checkout master'",
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

module.exports = RetrieveMaster;
