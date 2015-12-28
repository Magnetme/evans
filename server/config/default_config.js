var Config = {
	Evans : {
		port : 8888,
		client_registration : {
			secrets : { // key - description
				"xxxxxxxxxxxxxxxxxxxxxxxxxxxx" : "Macbook Pro 15"
			}
		},
		repository : {
			clone_url : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
		},
		githubUsername: 'xxxxxxxx',
		webhook : {
			port: 7777,
			path : '/xxxxxx',
			secret : 'xxxxxxxxxx'
		}
	},
	GitHubAPI : {
		token : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
	},
	HipChat : {
		token : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
		room : 'xxxxxxxx'
	},
	S3 : {
		accessKeyId: 'xxxxxxxxxx',
		secretAccessKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
		region: 'xxxxxxxxxx'
	}
};

module.exports = Config;
