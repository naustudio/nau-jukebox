/**
 * Zing MP3 URL parser module
 */
import { SongOrigin } from '../constants.js';
import { getGzipURL } from './getGzipURL';

var jsonURLReg = /\/json\/song\/get-source\/(\w+)/;
var avatarURLReg = /thumb-art.*?"(https?:\/\/[^"]*)/;
var lyricReg = /<p class="fn-wlyrics fn-content".*?>([\s\S]*?)<\/p>/;
//sample avatar image from Zing HTML page: <img class="thumb-art" width="110" src="http://image.mp3.zdn.vn/thumb/165_165/avatars/6/2/62b05bf415a3736e551cae7ed1ce90f2_1450237124.jpg" alt="Min">

/**
 * Get Zing stream URL and other info
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
export const getSongInfoZing = function(songurl) {
	var linkRes, jsonURLResults, lyricResults, jsonURL, thumb, lyric;

	// First Step: parse the HTML page to get the XML data URL for the flash-based player

	try {
		linkRes = getGzipURL(songurl);
	} catch (err) {
		console.error('Get Zing MP3 URL Error', err);
	}

	linkRes = (linkRes.content) ? linkRes.content : '';
	// console.log('linkRes:', linkRes);

	// run the html against regexp to get JSON URL
	jsonURLResults = jsonURLReg.exec(linkRes);


	if (jsonURLResults) {
		jsonURL = 'http://mp3.zing.vn' + jsonURLResults[0];
		console.log('jsonURLResults:', jsonURL);
	} else {
		console.log('jsonURL parse failed');
		return null;
	}

	thumb = avatarURLReg.exec(linkRes);

	if (thumb) {
		thumb = thumb[1];
		console.log('Thumb URL', thumb);
	}

	lyricResults = lyricReg.exec(linkRes);
	if (lyricResults) {
		lyric = lyricResults[1];
		console.log('lyricResult: ', lyricResults[1]);
	} else {
		console.log('lyric get failed');
	}

	// Second Step: get the XML data file for the sone

	var jsonRes, json;

	try {
		jsonRes = getGzipURL(jsonURL);
		jsonRes = jsonRes.content;
		console.log('Response:', jsonRes);

		// Third Step: parse and convert the resp string to JSON object

		json = JSON.parse(jsonRes);
		// see sample JSON below

	} catch (err) {
		console.error('Get Zing stream Error', err);
	}

	// Fourth Step: normalize the JSON object to a song record

	if (json && json.data && json.data[0]) {
		var jsonItem = json.data[0];

		//Not so soon, some Zing URL are blocked due to copyright issue
		if (jsonItem.source_list[0] && String(json.msg) === '0') {
			console.log('URL is valid. Adding new song.');
			return {
				timeAdded: Date.now(),
				originalURL: songurl,
				origin: SongOrigin.ZING,
				name: jsonItem.name,
				artist: jsonItem.artist,
				streamURL: jsonItem.source_list[0],
				thumbURL: thumb,
				lyric: lyric,
				play: 0
			};
		} else if (jsonItem.msg) {
			console.log('Error received: ' + jsonItem.msg);
			return {
				error: jsonItem.msg
			};
		} else {
			console.log('Unknown errors');
			return {
				error: 'Errors unknown.'
			};
		}

	} else {
		console.log('Can\'t parse link');
		return {
			error: 'Can\'t parse and get song info from link'
		};
	}
};

// sample JSON response:
// {
//   "msg": 0,
//   "data": [
//     {
//       "id": "ZWZBZCIF",
//       "name": "Vì Yêu",
//       "artist": "Kasim Hoàng Vũ",
//       "link": "/bai-hat/Vi-Yeu-Kasim-Hoang-Vu/ZWZBZCIF.html",
//       "cover": "http://zmp3-photo-td.zadn.vn/cover3_artist/1/3/13e5a66f038b4430a2bd5c0caccd52cc_1412907209.jpg",
//       "msg": "Do vấn đề kết nối, trình duyệt tạm thời không load được. Bạn vui lòng gửi phản hồi về Zing MP3 để nhận được hỗ trợ tốt nhất.",
//       "qualities": [
//         "128",
//         "320"
//       ],
//       "source_list": [
//         "http://zmp3-mp3-s1.zadn.vn/96d8db584f1ca642ff0d/2100605261626217079?authen=exp=1505431395~acl=/96d8db584f1ca642ff0d/*~hmac=f692eccda42ebc3e7752260d81b241ca",
//         ""
//       ],
//       "source_base": "http://",
//       "lyric": "http://static.mp3.zdn.vn/lyrics/2017/c/9/c948e64f07b04db3a44f13052c128033.txt"
//     }
//   ]
// }
