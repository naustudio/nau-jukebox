/* © 2017 NauStud.io
 * @author Thanh Tran
 */
import { HTTP } from 'meteor/http';
import { SongOrigin } from '../constants.js';

/**
 * Youtube URL parser module
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
export const getSongInfoYouTube = (songurl) => {
	console.log('getting youtube link:', songurl);
	let http = HTTP.call('GET', songurl);

	let html = http.content;
	// console.log(html);

	if (html) {
		console.log('Parsing the song data through html source');

		let title = (/<meta.*name="title".*content="(.*?)">/ig).exec(html);
		let thumbURL = (/watch-header[\s\S]*?yt-thumb-clip[\s\S]*?<img.*data-thumb="(.*?)"/igm).exec(html);
		let user = (/watch-header[\s\S]*?"yt-user-info"\s*>[\s\S]*?>(.*)<\/a>/igm).exec(html);
		let length = (/"length_seconds":"(\d*)"/).exec(html);
		length = length ? (+length[1]) : 0;
		console.log(length);

		if (!html.match(/"allow_embed":"1"/i)) {
			return {
				error: 'This YouTube video is not allowed to embed'
			};
		} else if (length > 10 * 60 || length < 10) {
			return {
				error: 'This YouTube video is too long (>10min) or too short (<10sec) to play'
			};
		} else {
			return {
				timeAdded: Date.now(),
				originalURL: songurl,
				origin: SongOrigin.YOUTUBE,
				name: title[1],
				artist: user[1], // this is not really means artist, this is the uploader field from youtube page
				streamURL: songurl, // media element can play youtube URL directly
				thumbURL: thumbURL[1],
				play: 0
			};
		}

	} else {
		console.log('Can\'t parse link');
		return {
			error: 'Can\'t parse and get song info from link'
		};
	}
};

