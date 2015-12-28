var config = require('./config/config.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var crypto = require('crypto');

var createHandler = require('github-webhook-handler');
var webhook = createHandler(config.Evans.webhook);

var Processes = require('./processes/processes.js');
var log = require('./logger.js').log;

/**
 * Setup Evans Administration Interface
 */

var clients = [];
app.use(bodyParser.json());
app.post('/client/register', function(req, res){
	if (!req.hasOwnProperty("body")) {
		res.statusCode = 422;
		res.send("Please provide a client secret.");
		return
	} else if (!req.body.hasOwnProperty("secret")) {
		res.statusCode = 422;
		res.send("Please provide a client secret.");
		return
	} else {
		var secret = req.body['secret'];
		if (!config.Evans.client_registration.secrets[secret]) {
			res.statusCode = 403;
			res.send("Provided client secret is incorrect.");
			return
		}
	}
	var client_id = crypto.randomBytes(20).toString('hex');
	var client = {
		id : client_id,
		name : config.Evans.client_registration.secrets[secret],
		last_active : new Date()
	};
	clients.push(client);
	log.info("New evans client registered: %s(%s).", config.Evans.client_registration.secrets[secret], client_id);
	var response = {id: client_id};
	res.send(JSON.stringify(response));
});

var authenticatedClient = function(req, res) {
	if (!req.hasOwnProperty("body")) {
		res.statusCode = 422;
		res.send("Please provide a client id.");
		return false
	} else if (!req.body.hasOwnProperty("client_id")) {
		res.statusCode = 422;
		res.send("Please provide a client id.");
		return false
	} else {
		var client_id = req.body['client_id'];
		if (clients.filter(function(client){return client.id == client_id}).length == 0) {
			res.statusCode = 403;
			res.send("Provided client secret is incorrect.");
			return false
		}
	}
	clients.filter(function(client){return client.id == client_id})[0].last_active = new Date();
	return true
};

var tasks = [
	{
		id : crypto.randomBytes(20).toString('hex'),
		created_on : new Date(),
		finished_on : null,
		status : "available",
		action: "build",
		branch: "master",
		commit : "703a2068ffc4b43dfafecc9acf5bc774909ca9d9",
		clone_url: "git@github.com:Magnetme/ios.git"
	}
];

app.post('/task', function(req, res){
	if (authenticatedClient(req, res)) {
		res.send(JSON.stringify(tasks));
	} else {
		return
	}
});

var retrieveClientName = function(client_id){
	return clients.filter(function(client){return client.id==client_id})[0].name;
};

app.post('/task/reserve', function(req, res){
	if (authenticatedClient(req, res)) {
		var client_id = req.body['client_id'];
		if (!req.body.hasOwnProperty('id')) {
			res.statusCode = 422;
			res.send("Please provide a task id.");
			return
		}
		var task_id = req.body['id'];
		if (tasks.filter(function(task){return task.id == task_id}).length == 0) {
			res.statusCode = 404;
			res.send("The task you requested was not found.");
		} else {
			tasks.forEach(function(task){
				if(task.id == task_id){
					if(task.status == 'available'){
						task.status = 'reserved';
						log.info('Client %s reserved task: %s.', retrieveClientName(client_id), task_id);
						res.send(JSON.stringify(task));
					} else {
						res.statusCode = 409;
						log.info('Client tried to reserve a task, which was already reserved');
						res.send("The task is already reserved");
						return
					}
				}
			});
		}
	}
});

app.post('/task/start', function(req, res){
	var client_id = req.body['client_id'];
	if (authenticatedClient(req, res)) {
		var task_id = req.body['id'];
		if (tasks.filter(function(task){return task.id == task_id}).length == 0) {
			res.statusCode = 404;
			res.send("The task you requested was not found.");
		} else {
			tasks.forEach(function(task){
				if(task.id == task_id){
					task.status = 'started'
				}
			});
			res.send("Task "+task_id+" status has been set to started.");
		}
	}
});

app.post('/task/finished', function(req, res){
	var client_id = req.body['client_id'];
	if (authenticatedClient(req, res)) {
		var task_id = req.body['id'];
		if (tasks.filter(function(task){return task.id == task_id}).length == 0) {
			res.statusCode = 404;
			res.send("The task you requested was not found.");
		} else {
			tasks.forEach(function(task){
				if(task.id == task_id){
					task.finished_on = new Date()
					task.status = 'finished'
				}
			});
			res.send("Task "+task_id+" status has been set to finished.");
		}
	}
});

var purgeClients = function() {
	var sixtyMinutesAgo = new Date();
	sixtyMinutesAgo.setMinutes(sixtyMinutesAgo.getMinutes()-60);
	log.info("Purging registered clients with last activity older than 60 minutes.");
	clients = clients.filter(function(client){
		return client.last_active > sixtyMinutesAgo;
	});
	setTimeout(function() {purgeClients()}, 60*1000); // 1 minute
};
setTimeout(function() {purgeClients()}, 60*1000); // 1 minute

var purgeFinishedTasks = function() {
	var sixtyMinutesAgo = new Date();
	sixtyMinutesAgo.setMinutes(sixtyMinutesAgo.getMinutes()-60);
	log.info("Purging finished tasks completed more than 60 minutes ago.");
	tasks = tasks.filter(function(task){
		if (task.finished_on) {
			return !((task.status == 'finished') && (task.finished_on < sixtyMinutesAgo));
		} else {
			return true
		}
	});
	setTimeout(function() {purgeFinishedTasks()}, 60*1000); // 1 minute
};

setTimeout(function() {purgeFinishedTasks()}, 60*1000); // 1 minute

app.listen(8888);

/**
 * Setup GitHub Webhook.
 */

http.createServer(function (req, res) {
	webhook(req, res, function (err) {
		log.warn('Evans was unable to respond to an HTTP request (404) at path \'%s\'.', req['url']);
		res.statusCode = 404;
		res.end('no such location');
	});
}).listen(config.Evans.webhook.port);

webhook.on('error', function (err) {
	log.error('Error: %s', err.message)
});

webhook.on('closed', function (event) {
	var payload = event.payload;
	if (payload.hasOwnProperty['pull_request']) {
		if (payload['pull_request']['merged']) {
			Processes.Automated.deployment.start(payload);
		}
	}
});

var handleCommentOnPullRequest = function(payload, callback){
	if (payload.hasOwnProperty("issue")){
		if (payload.issue.hasOwnProperty("pull_request")) {
			log.verbose("Scanning comment from ("+payload.comment.html_url+").");
			callback()
		}
	}
};

webhook.on('issue_comment', function (event) {
	var payload = event.payload;
	handleCommentOnPullRequest(payload, function() {
		var comment = payload.comment.body;
		var evansUsername = config.Evans.githubUsername;
		switch (comment) {
			case '@'+evansUsername+' build':
				Processes.Requested.build.start(payload);
				break;
			case '@'+evansUsername+' screenshots':
				Processes.Requested.screenshots.start(payload);
				break;
			case '@'+evansUsername+' testflight':
				Processes.Requested.testflight.start(payload);
				break;
			default:
				log.verbose('Comment ignored, not directed towards Evans.')
		}
	});
});

webhook.on('*', function (event) {
	console.log(event.payload)
});

log.info('Finished launching Evans, accessible at http://localhost:%s', config.Evans.webhook.port);
