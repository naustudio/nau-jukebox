// Set up a collection to contain song information. On the server,
// it is backed by a MongoDB collection named 'songs'.

/*global Songs:true*/

Songs = new Meteor.Collection('songs');

if (Meteor.isClient) {
	Template.songlist.songs = function() {
		return Songs.find({}, {sort: {name: 1}});
	};

	// Template.songlist.selected_name = function() {
	// 	var player = Songs.findOne(Session.get('selected_player'));
	// 	return player && player.name;
	// };

	// Template.player.selected = function() {
	// 	return Session.equals('selected_player', this._id) ? 'selected' : '';
	// };

	Template.songlist.events({
		'submit #add-song-form': function(event) {
			event.preventDefault();
			var submitData = $(event.currentTarget).serializeArray();
			var songurl;

			for (var i = 0; i < submitData.length; i++) {
				if (submitData[i].name === 'songurl') {
					songurl = submitData[i].value;
				}
			}

			// alert('Song list add ' + songurl);

			//call server
			Meteor.call('getNctMp3', songurl);
		}
	});

	// Template.player.events({
	// 	'click': function() {
	// 		Session.set('selected_player', this._id);
	// 	}
	// });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function() {
		//empty

	});

	Meteor.methods({
		removeAllSongs: function() {
			return Songs.remove({});
		},

		getNctMp3: function(songurl) {
			var res;
			var songInfo = parseNctUrl(songurl);
			console.log(songInfo.name, ' - ', songInfo.id);

			try {
				res = HTTP.get('http://www.nhaccuatui.com/download/song/' + songInfo.id);
				// console.log('Response:', res);
				res = res.data; // ignore headers and status code
			} catch (err) {
				console.error('Get NCT stream Error', err);
			}
			// sample response:
			// {
			//   "error_message": "Success",
			//   "data": {
			//     "stream_url": "http://download.f9.stream.nixcdn.com/ed5b78e45f4a38095c13836b58fd2037/5405e6df/NhacCuaTui869/GatDiNuocMat-NooPhuocThinhTonnyViet-3328664_hq.mp3",
			//     "is_charge": "false"
			//   },
			//   "error_code": 0,
			//   "STATUS_READ_MODE": true
			// }

			console.log(res);
			if (res && res.data && res.data.stream_url) {
				console.log('Adding new Song');
				Songs.insert({
					id: songInfo.id,
					name: songInfo.name,
					stream_url: res.data.stream_url
				});
			}
		}
	});
}

// Utility / Private functions
var nctRegExp = /\/([^\/]+)\.([^.]+)\.html/;

function parseNctUrl(songurl) {
	var parsed = String(songurl).match(nctRegExp);

	return {
		name: toTitleCase(parsed[1]).split('-').join(' '),
		id: String(parsed[2])
	};
}

function toTitleCase(s) {
	s = String(s).toLowerCase();
	return s.replace( /\b[a-z]/g, function(f) { return f.toUpperCase(); } );
}
