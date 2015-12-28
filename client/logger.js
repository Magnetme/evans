var winston = require('winston');

module.exports = {
	log : new (winston.Logger)({
		transports : [
			new winston.transports.Console({
				level : 'verbose',
				handleExceptions : true,
				json : false,
				colorize : true,
				timestamp : true
			})
		]
	})
};
