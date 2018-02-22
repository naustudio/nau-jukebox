/* © 2017 NauStud.io
 * @author Tung Tran
 *
 * Soudcloud URL parser module
 */
import { HTTP } from 'meteor/http';
import { SongOrigin, defaultThumbnailUrl } from '../constants.js';

/**
 * Get NCT stream URL and other info
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
const getSongInfoSoundcloud = songurl => {
	const json = HTTP.call(
		'GET',
		`https://api.soundcloud.com/resolve.json?url=${songurl}&client_id=f6dbfb46c6b75cb6b5cd84aeb50d79e3`
	);
	console.log(json);

	if (json && json.data) {
		console.log('Checking the XML data');
		if (json.data.streamable) {
			return {
				timeAdded: Date.now(),
				originalURL: songurl,
				origin: SongOrigin.SOUNDCLOUD,
				name: json.data.title,
				artist: json.data.user.username,
				streamURL: `/tracks/${json.data.id}`,
				thumbURL: json.data.user.avatar_url || defaultThumbnailUrl,
				play: 0,
			};
		}

		return {
			error: 'This Soundcloud is not streamable',
		};
	}

	return {
		error: 'Can\'t parse and get song info from link',
	};
};

export default getSongInfoSoundcloud;
