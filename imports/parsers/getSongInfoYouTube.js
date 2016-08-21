/**
 * Youtube URL parser module
 */
import { HTTP } from 'meteor/http';




/**
 * Get NCT stream URL and other info
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
export const getSongInfoYouTube = function(songurl) {
	console.log('getting youtube link:', songurl);
	let html = HTTP.call('GET', songurl);

	console.log(html);

	//TODO: to parse YouTube metadata here


	if (true) {
		console.log('Checking the XML data');

		if (true) {
			return {
				timeAdded: Date.now(),
				originalURL: songurl,
				origin: 'YouTube',
				name: 'title',
				artist: 'uploader',
				streamURL: songurl, // mediaelement can play youtube URL directly
				thumbURL: 'https://yt3.ggpht.com/-qfdylQER4GU/AAAAAAAAAAI/AAAAAAAAAAA/QQTnVEWuEU4/s88-c-k-no-mo-rj-c0xffffff/photo.jpg',
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

