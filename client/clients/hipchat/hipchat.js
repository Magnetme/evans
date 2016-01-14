var request = require('request');
var config = require('../../config/config.js');
var log = require('../../logger.js').log;

function HipChat() {
	var client = {
		sendMessage : function(message, callback) {
			log.verbose('Sending message to HipChat.');
			var url = 'https://api.hipchat.com/v1/rooms/message?message_format='+message.message_format+'&room_id=' + config.HipChat.room +'&auth_token=' + config.HipChat.token + '&from='+message.from+'&notify=false&format=json&color=' + message.color;
			request.post(url, {
				form: message
			}, function(err, res, body) {
				if(err){
					log.error(err);
				}
				if (callback) {
					callback()
				}
			});
		}
	};
	return client;
}

module.exports = HipChat;
