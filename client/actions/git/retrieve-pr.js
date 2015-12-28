var exec = require('child_process').exec;

function RetrievePR(task) {
	var clone_url = task.clone_url;
	var pr_dir = "/tmp/evans/" + task.id + "/";

	var process = {
		directory : pr_dir,
		command : "/bin/bash -c 'mkdir -p "+pr_dir+" && cd "+pr_dir+" && git clone "+clone_url+" . --depth=1 -b ",
		branch : task.branch,
		log : "",
		error : "",
		run : function(callbacks) {
			exec(this.command+this.branch + "'", function(err, stdout, stderr) {
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
