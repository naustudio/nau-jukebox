/* © 2017 NauStud.io
 * @author Thanh Tran
 */
import { HTTP } from 'meteor/http';
import { SongOrigin, defaultThumbnailUrl } from '../constants.js';

/**
 * Youtube URL parser module
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
const getSongInfoYouTube = songurl => {
	const http = HTTP.call('GET', songurl);

	const regex = /v=([^&]*)/;
	let songId = regex.exec(songurl)[0];
	songId = songId.split('=')[1];

	const html = http.content;

	if (html) {
		console.log('Parsing the song data through html source');

		const title = /<meta.*name="title".*content="(.*?)">/gi.exec(html);
		// const thumbURL = /watch-header[\s\S]*?yt-thumb-clip[\s\S]*?<img.*data-thumb="(.*?)"/gim.exec(html);
		const user = /watch-header[\s\S]*?"yt-user-info"\s*>[\s\S]*?>(.*)<\/a>/gim.exec(html);
		let length = /"length_seconds":"(\d*)"/.exec(html);
		const thumbURL = `https://img.youtube.com/vi/${songId}/0.jpg`;
		length = length ? +length[1] : 0;
		console.log(title[1], '|', user[1], '|', length);

		if (html.match(/\\?"playableInEmbed\\?":false/i)) {
			return {
				error: 'This YouTube video is not allowed to embed',
			};
		} else if (length > 15 * 60 || length < 10) {
			return {
				error: 'This YouTube video is too long (>15min) or too short (<10sec) to play',
			};
		}

		return {
			timeAdded: Date.now(),
			originalURL: songurl,
			origin: SongOrigin.YOUTUBE,
			name: title[1],
			artist: user[1], // this is not really means artist, this is the uploader field from youtube page
			streamURL: songurl, // media element can play youtube URL directly
			thumbURL: thumbURL || defaultThumbnailUrl,
			play: 0,
		};
	}

	return {
		error: "Can't parse and get song info from link",
	};
};

export default getSongInfoYouTube;
