/* © 2017 NauStud.io
 * @author Thanh Tran
 *
 * NCT URL parser module
 */
import { xml2js } from 'meteor/vjau:xml2js';
import getGzipURL from './getGzipURL';
import { SongOrigin, defaultThumbnailUrl } from '../constants.js';

// Utility / Private functions
const xmlURLReg = /https?:\/\/(?:www)?.nhaccuatui.com\/flash\/xml\?.*?key1=(\w+)/;
const lyricReg = /<p id="divLyric"[\s\S]+ <\/p>/;
// sample xml url: "http://www.nhaccuatui.com/flash/xml?key1=99decd7306277634419b987bed859265"

/**
 * Get NCT stream URL and other info
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
const getSongInfoNct = songurl => {
	let linkRes;
	let xmlURL;
	let lyric;

	// First Step: parse the HTML page to get the XML data URL for the flash-based player

	try {
		linkRes = getGzipURL(songurl);
	} catch (err) {
		console.error('Get NCT MP3 URL Error', err);
	}

	linkRes = linkRes && linkRes.content ? linkRes.content : '';
	// console.log('linkRes:', linkRes);

	// run the html against regexp to get XML URL
	const xmlURLResults = xmlURLReg.exec(linkRes);
	const lyricResults = lyricReg.exec(linkRes);

	if (xmlURLResults) {
		xmlURL = xmlURLResults[0];
		console.log('xmlURLResults:', xmlURLResults[0]);
	} else {
		console.log('xmlURL parse failed');

		return null;
	}

	if (lyricResults) {
		// eslint-disable-next-line no-script-url
		if (lyricResults[0].includes('javascript:;')) {
			lyric = null;
		} else {
			lyric = lyricResults[0];
		}
		console.log('lyricResult: ', lyricResults[0]);
	} else {
		console.log('lyric get failed');
	}

	// Second Step: get the XML data file for the sone

	let xmlRes;

	let json;

	// Note: Manually install the node package in server folder
	const parser = new xml2js.Parser({
		trim: true,
	});

	// console.log('XML2JS:', XML2JS);

	try {
		xmlRes = getGzipURL(xmlURL);
		xmlRes = xmlRes.content;
		// console.log('Response:', xmlRes);

		// Third Step: parse and convert the XML string to JSON object

		parser.parseString(xmlRes, (error, result) => {
			json = result;
		});
		console.log(`==> ${JSON.stringify(json)}`);
		// see sample JSON below
	} catch (err) {
		console.error('Get NCT stream Error', err);
	}

	// Fourth Step: normalize the JSON object to a song record

	if (json && json.tracklist && json.tracklist.track[0]) {
		console.log('Checking the XML data');
		const track = json.tracklist.track[0];

		//TODO: need to check if we ever got error with copyright checker like Zing
		if (track.location[0] /*&& String(track.errorcode[0]) === '0'*/) {
			console.log('URL is valid. Adding new song.');

			return {
				timeAdded: Date.now(),
				originalURL: songurl,
				origin: SongOrigin.NHACCUATUI,
				name: track.title[0],
				artist: track.creator[0],
				streamURL: track.location[0],
				thumbURL: track.avatar[0] || defaultThumbnailUrl,
				lyric,
				play: 0,
			};
		} else if (track.errormessage[0]) {
			console.log(`Error received: ${track.errormessage[0]}`);

			return {
				error: track.errormessage[0],
			};
		}
		console.log('Unknown errors');

		return {
			error: 'Errors unknown.',
		};
	}
	console.log("Can't parse link");

	return {
		error: "Can't parse and get song info from link",
	};
};

export default getSongInfoNct;

//sample json:
// {
// 	"tracklist": {
// 		"type": [
// 			"song"
// 		],
// 		"track": [
// 			{
// 				"title": [
// 					"Tâm Sự Với Người Lạ"
// 				],
// 				"creator": [
// 					"Tiên Cookie"
// 				],
// 				"location": [
// 					"http://s82.stream.nixcdn.com/bd786719943728e32606ccc9f113864b/56dd7572/NhacCuaTui913/TamSuVoiNguoiLa-TienCookie-4282715.mp3"
// 				],
// 				"info": [
// 					"http://www.nhaccuatui.com/bai-hat/tam-su-voi-nguoi-la-tien-cookie.H8GqrTEErwJR.html"
// 				],
// 				"image": [
// 					"http://avatar.nct.nixcdn.com/singer/avatar/2016/01/25/4/1/1/7/1453716830438.jpg"
// 				],
// 				"thumb": [
// 					""
// 				],
// 				"bgimage": [
// 					"http://avatar.nct.nixcdn.com/singer/avatar/2016/01/25/4/1/1/7/1453716830438.jpg"
// 				],
// 				"avatar": [
// 					"http://avatar.nct.nixcdn.com/singer/avatar/2016/01/25/4/1/1/7/1453716830438.jpg"
// 				],
// 				"lyric": [
// 					"http://lrc.nct.nixcdn.com/2016/02/26/4/7/a/1/1456452594231.lrc"
// 				],
// 				"newtab": [
// 					"http://www.nhaccuatui.com/nghe-si-tien-cookie.html"
// 				],
// 				"kbit": [
// 					"320"
// 				],
// 				"key": [
// 					"H8GqrTEErwJR"
// 				]
// 			}
// 		]
// 	}
// }
