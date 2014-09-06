/**
 * NCT URL parser module
 */
/*global getSongInfoNct:true*/

// Utility / Private functions
var nctRegExp = /\/([^\/]+)\.([^.]+)\.html/;

/**
 * [parseNctURL description]
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
function parseNctURL(songurl) {
	var parsed = String(songurl).match(nctRegExp);

	return {
		name: toTitleCase(parsed[1]).split('-').join(' '),
		id: String(parsed[2])
	};
}

/**
 * [toTitleCase description]
 * @param  {[type]} s [description]
 * @return {[type]}   [description]
 */
function toTitleCase(s) {
	s = String(s).toLowerCase();
	return s.replace( /\b[a-z]/g, function(f) { return f.toUpperCase(); } );
}

/**
 * Get NCT stream URL and other info
 *
 * @param  {[type]} songurl [description]
 * @return {[type]}         [description]
 */
getSongInfoNct = function(songurl) {
	var res;
	var songInfo = parseNctURL(songurl);
	console.log(songInfo.name, ' - ', songInfo.id);

	try {
		// old way
		// res = HTTP.get('http://www.nhaccuatui.com/download/song/' + songInfo.id);

		res = HTTP.post('http://getlinkmusic.appspot.com/getlinkjson', {
			params: {
				tb_link: songurl
			}
		});

		//TODO: get mp3.zing info using http://mp3-zing.kenh76.vn/`

		console.log('Response:', res);
		res = JSON.parse(res.content); // ignore headers and status code
	} catch (err) {
		console.error('Get NCT stream Error', err);
	}
	// sample response:
	// {
	//   "data": [
	//     {
	//       "creator": "Maroon 5",
	//       "lyric": "http://lrc.nct.nixcdn.com/2014/08/19/f/0/c/0/1408465315444.lrc",
	//       "location": "http://aredir.nixcdn.com/3c9ac28f32f504cba923fe8e0086f94e/5406968d/Unv_Audio20/Maps-Maroon5-3298999.mp3",
	//       "title": "Maps"
	//     }
	//   ]
	// }

	res = res.data[0];
	console.log(res);
	if (res && res.location) {
		console.log('Adding new Song');

		return {
			timeAdded: Date.now(),
			originalURL: songurl,
			name: res.title,
			artist: res.creator,
			streamURL: res.location
		};
	} else {
		return null;
	}
};