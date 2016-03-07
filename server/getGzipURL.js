/*global getGzipURL:true, HTTP:true*/

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
		npmRequestOptions: {
			gzip: true
		}

		// timeout: options.timeout,
		// body: content,
		// followRedirect: options.followRedirects,
		// headers: headers
	};

	HTTP.get(url, reqOptions, function(error, result) {
		callback(error, result);
	});
});
