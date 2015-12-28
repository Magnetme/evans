var s3api = require('s3');
var config = require('../../config/config.js');

var S3 = s3api.createClient({
	maxAsyncS3: 20,     // this is the default
	s3RetryCount: 3,    // this is the default
	s3RetryDelay: 1000, // this is the default
	multipartUploadThreshold: 20971520, // this is the default (20 MB)
	multipartUploadSize: 15728640, // this is the default (15 MB)
	s3Options: config.S3
});

module.exports = S3;