var exec = require('child_process').exec;

function CocoaPods(wd) {
	var pod = {
		command : "/bin/bash -c 'cd " + wd + " && pod install | strip-ansi'",
		log : "",
		error : "",
		run : function(callbacks) {
			exec(this.command, function(err, stdout, stderr) {
				if (err) {
					pod.error = err;
				}
				if(stderr){
					pod.log += stderr;
				}
				if(stdout){
					pod.log += stdout;
				}

				callbacks.forEach(function(callback){
					callback(err);
				})
			});
		}
	};

	return pod;
}

module.exports = CocoaPods;
