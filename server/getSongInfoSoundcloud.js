/**
 * Soudcloud URL parser module
 */

/**
 * Get NCT stream URL and other info
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
export const getSongInfoSoundcloud = function(songurl) {
	var json;
	// First Step: Initialize Soundcloud API

	// Second Step: Resolve Soundcloud URL
	json = HTTP.call('GET', 'http://api.soundcloud.com/resolve.json?url=' + songurl + '&client_id=f6dbfb46c6b75cb6b5cd84aeb50d79e3');
	console.log(json);

	if (json && json.data) {
		console.log('Checking the XML data');
		if (json.data.streamable) {
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
		} else {
			return {
				error: 'This Soundcloud is not streamable'
			};
		}

	} else {
		console.log('Can\'t parse link');
		return {
			error: 'Can\'t parse and get song info from link'
		};
	}
};
