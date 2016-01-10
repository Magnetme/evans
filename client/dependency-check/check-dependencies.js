var exec = require('child_process').exec;
var log = require('../logger.js').log;

var async = require('async');

var dependencies = [
	{
		name: 'brew',
		instructions: 'ruby -e \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)\"'
	},
	{
		name: 'git',
		instructions: 'brew install git'
	},
	{
		name: 'gym',
		instructions: 'sudo gem install gum'
	},
	{
		name: 'pilot',
		instructions: 'sudo gem install pilot'
	},
	{
		name: 'pod',
		instructions: 'brew install cocoapods'
	},
	{
		name: 'match',
		instructions: 'sudo gem install match'
	},
	{
		name: 'snapshot',
		instructions: 'sudo gem install snapshot'
	},
	{
		name: 'agvtool',
		instructions: 'xcode-select --install'
	},
	{
		name: 'strip-ansi',
		instructions: 'sudo npm install strip-ansi-cli -g'
	}];

var checkForDependency = function(dep, callback) {
	var command = dep.name;
	exec("command -v " + command + " >/dev/null 2>&1 || { exit 1; }", function(err, stdout, stderr) {
		if (err) {
			log.error('\'' + command + '\' is not installed. Please install \'' + command + '\' before continuing.');
			log.error('Use \''+dep.instructions+'\' to install \''+ command +'\'.');
		} else {
			log.verbose('Checking for dependency '+ command + '... Found!');
		}
		callback(err)
	});
};

dependencyChecks = [];

dependencies.forEach(function(dep){
	var check = function(callback){
		checkForDependency(dep,callback)
	};
	dependencyChecks.push(check);
});

var checkDependencies = function(callback) {
	async.series(dependencyChecks, function(err){
		if(err){
			callback(false);
		} else {
			callback(true);
		}
	});
};

module.exports = checkDependencies;
