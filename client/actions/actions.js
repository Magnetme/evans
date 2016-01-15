var RetrievePR = require('./git/retrieve-pr.js');
var CocoaPods = require('./build/cocoapods.js');
var Gym = require('./build/gym.js');
var Snapshot = require('./build/snapshot.js');
var Pilot = require('./build/pilot.js');

var IncreaseBuildNumber = require('./metadata/increase-build-nr.js');
var RetrieveBuildNumber = require('./metadata/retrieve-build-nr.js');

var CommitEditedFiles = require('./git/commit-edited.js');
var Push = require('./git/push.js');

var Kill = require('./processes/kill.js');

var Actions = {
	RetrievePR : RetrievePR,
	CocoaPods : CocoaPods,
	Gym : Gym,
	Pilot : Pilot,
	Snapshot : Snapshot,
	Git : {
		CommitEditedFiles : CommitEditedFiles,
		Push : Push
	},
	Metadata : {
		InreaseBuildNumber : IncreaseBuildNumber,
		RetrieveBuildNumber : RetrieveBuildNumber
	},
	Processes : {
		Kill : Kill
	}
};

module.exports = Actions;
