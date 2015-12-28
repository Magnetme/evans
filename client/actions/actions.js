var RetrievePR = require('./git/retrieve-pr.js');
var RetrieveMaster = require('./git/retrieve-master.js');
var CocoaPods = require('./build/cocoapods.js');
var Gym = require('./build/gym.js');
var Snapshot = require('./build/snapshot.js');
var Pilot = require('./build/pilot.js');

var IncreaseBuildNumber = require('./metadata/increase-build-nr.js');
var RetrieveBuildNumber = require('./metadata/retrieve-build-nr.js');

var CommitEditedFiles = require('./git/commit-edited.js');
var Push = require('./git/push.js');

var Actions = {
	RetrievePR : RetrievePR,
	RetrieveMaster : RetrieveMaster,
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
	}
};

module.exports = Actions;
