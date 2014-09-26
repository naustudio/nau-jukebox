/*global getGzipURL:true*/
var request = Npm.require('request');
var zlib = Npm.require('zlib');

/**
 * getGzipURL
 * @param  {[type]}   url      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
getGzipURL = Meteor.wrapAsync(function(url, callback) {
	// Learn this synchronous wrapper technique in http package source
	var reqOptions = {
		url: url,
		method: 'GET',
		encoding: null,
		jar: false,
		gzip: true
		// timeout: options.timeout,
		// body: content,
		// followRedirect: options.followRedirects,
		// headers: headers
	};

	request(reqOptions, function(error, res, body) {
		var response = null;

		/*jshint eqeqeq:false*/
		if (!error && res.statusCode == 200) {
			response = {};
			response.statusCode = res.statusCode;
			response.content = body;
			response.headers = res.headers;
			// If res is gzip, unzip first
			var encoding = res.headers['content-encoding'];
			if (encoding && encoding.contains('gzip')) {
				zlib.gunzip(body, function(err, dezipped) {
					response.content = dezipped.toString('utf-8');
					// console.log('response.content', response.content);
					callback(error, response);
				});
			} else {
				// Response is not gzipped
				callback(error, response);
			}
		}

		if (res.statusCode >= 400) {
			// error = makeErrorByStatus(response.statusCode, response.content);
			callback(new Error('failed[' + res.statusCode + ']'), response);
		}
	});
});