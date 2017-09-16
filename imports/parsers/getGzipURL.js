/* © 2017 NauStud.io
 * @author Thanh Tran
 */
import { HTTP } from 'meteor/http';

/**
 * getGzipURL
 * @param  {[type]}   url      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
export const getGzipURL = Meteor.wrapAsync(function(url, callback) {
	// Learn this synchronous wrapper technique in http package source
	const reqOptions = {
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
