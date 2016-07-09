/**
 * Soudcloud URL parser module
 */
/*global getSongInfoSoundcloud:false, SC: true*/

/**
 * Get NCT stream URL and other info
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
getSongInfoSoundcloud = function(songurl) {
	var json;
	// First Step: Initialize Soundcloud API

	// Second Step: Resolve Soundcloud URL
	json = HTTP.call('GET', 'http://api.soundcloud.com/resolve.json?url=' + songurl + '&client_id=f6dbfb46c6b75cb6b5cd84aeb50d79e3');
	console.log(json);

	if (json && json.data) {
		console.log('Checking the XML data');

	// 	//TODO: need to check if we ever got error with copyright checker like Zing
	// 	if (track.location[0] /*&& String(track.errorcode[0]) === '0'*/) {
	// 		console.log('URL is valid. Adding new song.');
	// 		// return { error: 'testing' }
		return {
			timeAdded: Date.now(),
			originalURL: songurl,
			origin: 'Soundcloud',
			name: json.data.title,
			artist: json.data.user.username,
			streamURL: '/tracks/' + json.data.id,
			thumbURL: json.data.user.avatar_url,
			play: 0
		};
	// 	} else if (track.errormessage[0]) {
	// 		console.log('Error received: ' + track.errormessage[0]);
	// 		return {
	// 			error: track.errormessage[0]
	// 		};
	// 	} else {
	// 		console.log('Unknown errors');
	// 		return {
	// 			error: 'Errors unknown.'
	// 		};
	// 	}

	} else {
		console.log('Can\'t parse link');
		return {
			error: 'Can\'t parse and get song info from link'
		};
	}
};