/* © 2017 NauStud.io
 * @author Thanh Tran
 *
 * Zing MP3 URL parser module
 */
import { SongOrigin, defaultThumbnailUrl } from '../constants.js';
import getGzipURL from './getGzipURL';

const jsonURLReg = /\/media\/get-source\?[A-z0-9?=&]+/;
const avatarURLReg = /thumb-art.*?"(https?:\/\/[^"]*)/;
const lyricReg = /<p class="fn-wlyrics fn-content".*?>([\s\S]*?)<\/p>/;
//sample avatar image from Zing HTML page: <img class="thumb-art" width="110" src="https://image.mp3.zdn.vn/thumb/165_165/avatars/6/2/62b05bf415a3736e551cae7ed1ce90f2_1450237124.jpg" alt="Min">

/**
 * Get Zing stream URL and other info
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
const getSongInfoZing = songurl => {
	let linkRes;
	let jsonURL;
	let thumb;
	let lyric;

	// First Step: parse the HTML page to get the XML data URL for the flash-based player

	try {
		linkRes = getGzipURL(songurl);
	} catch (err) {
		console.error('Get Zing MP3 URL Error', err);
	}

	linkRes = linkRes && linkRes.content ? linkRes.content : '';
	// console.log('linkRes:', linkRes);

	// run the html against regexp to get JSON URL
	const jsonURLResults = jsonURLReg.exec(linkRes);

	if (jsonURLResults) {
		jsonURL = `https://mp3.zing.vn/xhr${jsonURLResults[0]}`;
		console.log('jsonURLResults:', jsonURL);
	} else {
		console.log('jsonURL parse failed');

		return null;
	}

	thumb = avatarURLReg.exec(linkRes);

	if (thumb) {
		thumb = thumb[1];
	}

	const lyricResults = lyricReg.exec(linkRes);
	if (lyricResults) {
		lyric = lyricResults[1];
		console.log('lyricResult: ', lyricResults[1]);
	} else {
		console.log('lyric get failed');
	}

	// Second Step: get the XML data file for the sone

	let jsonRes;
	let json;

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

	if (json && json.data) {
		const jsonItem = json.data;

		//Not so soon, some Zing URL are blocked due to copyright issue
		if (jsonItem.source['128'] && String(json.err) === '0') {
			console.log('URL is valid. Adding new song.');
			let artist = jsonItem.artist ? jsonItem.artist.name : jsonItem.performer;
			if (jsonItem.artists && jsonItem.artists.length) {
				artist = jsonItem.artists.map(a => a.name.trim()).join(', ');
			}

			return {
				timeAdded: Date.now(),
				originalURL: songurl,
				origin: SongOrigin.ZING,
				name: jsonItem.name,
				artist,
				streamURL: jsonItem.source['128'],
				thumbURL: thumb || defaultThumbnailUrl,
				lyric,
				play: 0,
			};
		} else if (jsonItem.msg) {
			console.log(`Error received: ${jsonItem.msg}`);

			return {
				error: jsonItem.msg,
			};
		}

		return {
			error: 'Errors unknown.',
		};
	}

	return {
		error: "Can't parse and get song info from link",
	};
};

export default getSongInfoZing;

// sample JSON response:
// {
//   "err": 0,
//   "msg": "Success",
//   "data": {
//     "id": "ZW8IAFB7",
//     "name": "Hãy Về Với Em",
//     "title": "Hãy Về Với Em",
//     "code": "LGxGTZHsXVJaCBRtGyDmLm",
//     "artists_names": "Tiêu Châu Như Quỳnh",
//     "artists": [
//       {
//         "name": "Tiêu Châu Như Quỳnh",
//         "link": "/nghe-si/Tieu-Chau-Nhu-Quynh"
//       },
//       {
//         "name": " Lam Trường",
//         "link": "/nghe-si/Lam-Truong"
//       }
//     ],
//     "performer": "Tiêu Châu Như Quỳnh",
//     "type": "audio",
//     "link": "/bai-hat/Hay-Ve-Voi-Em-Tieu-Chau-Nhu-Quynh-Lam-Truong/ZW8IAFB7.html",
//     "lyric": "https://static.mp3.zdn.vn/lyrics/2017/8/c/8ca8ab3759f88577dc159c93576361ec.lrc",
//     "thumbnail": "https://zmp3-photo-td.zadn.vn/thumb/94_94/covers/c/b/cbc93367d52a046fa172d93feae723c3_1506096854.jpg",
//     "source": {
//       "128": "https://zmp3-mp3-s1-tr.zadn.vn/e05ce2a039e4d0ba89f5/4530298469223166646?key=92P456LfkBKH1OCT0nt7Ew&expires=1506416908",
//       "320": ""
//     },
//     "artist": {
//       "id": "IWZ968Z8",
//       "name": "Tiêu Châu Như Quỳnh",
//       "link": "/nghe-si/Tieu-Chau-Nhu-Quynh",
//       "cover": "https://zmp3-photo-td.zadn.vn/cover_artist/e/a/eaa047b33faa720e6ba4bfefa8fbb5c5_1506308126.jpg",
//       "thumbnail": "https://zmp3-photo-td.zadn.vn/thumb/240_240/avatars/e/7/e7409888a3386108fbf2fac30c075209_1482896982.jpg"
//     },
//     "is_vip": false
//   },
//   "timestamp": 1506330508398
// }
