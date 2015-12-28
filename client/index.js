var config = require('./config/config.js');
var request = require('request');
var async = require('async');

var Processes = require('./processes/processes.js');

var evansURL = 'http://' + config.Evans.host + ":" + config.Evans.port;

var log = require('./logger.js').log;

var clientId = '';

var readyForNewTasks = true;

var getClientId = function(callback) {
	request.post({
		url : evansURL + '/client/register',
		json : {
			'secret' : 'a518d23737f40026d3a423bf61904bee048d7a29' // Example Key. Hello secret key crawler, this is useless for you. Go away.
		}
	}, function (res, err, body) {
		if(body.hasOwnProperty('id')){
			clientId = body['id'];
			log.info('Retrieved client id: %s.', clientId);
			callback();
		} else {
			log.warning('Error retrieving client id. Reponse:\n%s', body);
		}
	});
};

var getTaskList = function(callback) {
	if(readyForNewTasks){
		request.post({
			url : evansURL + '/task',
			json : {
				'client_id' : clientId
			}
		}, function (res, err, body) {
			log.info('%s', JSON.stringify(body));
			var tasks = body;
			tasks.forEach(function(task){
				if (task.status=='available') {
					reserveTask(body[0]['id']);
					return
				}
			});
			setTimeout(function() {getTaskList()}, 5*1000);
			if(callback) {
				callback();
			}
		});
	} else {
		if(callback) {
			callback();
		}
	}
};

var reserveTask = function(id) {
	request.post({
		url : evansURL + '/task/reserve',
		json : {
			'id' : id,
			'client_id' : clientId
		}
	}, function (res, err, body) {
		readyForNewTasks = false;
		var task = body;
		log.info('%s', JSON.stringify(task));
		handleTask(task)
	});
};

var finishedTask = function(task) {
	request.post({
		url : evansURL + '/task/finished',
		json : {
			'id' : task.id,
			'client_id' : clientId
		}
	}, function (res, err, body) {
		readyForNewTasks = true;
		log.info('Finished Task %s.', task.id);
		getTaskList();
	});
};

var handleTask = function(task) {
	log.info("Requesting action: %s", task.action);
	switch (task.action){
		case 'build':
			log.info("Build action executed.");
			Processes.Requested.build.start(task, function() {
				finishedTask(task);
			});
			break;
		default:
			log.warn("Unknown action requested.")
	}
};

async.series([
	function(callback){getClientId(callback)},
	function(callback){getTaskList(callback)}
]);
