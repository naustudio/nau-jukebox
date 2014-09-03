// Set up a collection to contain song information. On the server,
// it is backed by a MongoDB collection named 'songs'.

/*global Songs:true, AppStates:true, Future:true*/

Songs = new Meteor.Collection('songs');
AppStates = new Meteor.Collection('appstates');

if (Meteor.isClient) {
	var SELECTED_SONG_SELECTOR;
	var player; //the MediaElement instance

	Template.songlist.songs = function() {
		return Songs.find({}, {sort: {time_added: 1}});
	};

	Template.song.selected = function() {
		return Session.equals('selected_song', this._id) ? 'selected' : '';
	};

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
			Meteor.call('getNctMp3', songurl, function(error, result) {
				console.log('getNctMp3 callback:', result);
				if (!result) {
					alert('Cannot add the song at:\n' + songurl);
					this.$('#songurl').val('');
				}
			});
		}
	});

	Template.song.events({
		'click .song-name': function() {
			console.log('to play:', this.stream_url, SELECTED_SONG_SELECTOR);
			AppStates.update(SELECTED_SONG_SELECTOR, {key: 'selected_song', value: this._id});

			player.pause();
			player.media.src = this.stream_url;
			player.play();
		},
		'click .remove-btn': function(e) {
			Songs.remove(this._id);
			if (Session.equals('selected_song', this._id)) {
				//selected song playing
				player.pause();
				player.media.src = '';
			}
			e.stopPropagation();
		}
	});
	/*global MediaElementPlayer*/
	Meteor.startup(function() {
		// init the media player
		player = new MediaElementPlayer('#audio-player', {
			success: function(mediaElement) {
				// audio ended
				mediaElement.addEventListener('ended', function() {
					console.log('Audio ended');
				});
			}
		});

		var selectedSongState = AppStates.findOne({key: 'selected_song'});
		SELECTED_SONG_SELECTOR = selectedSongState._id;
		console.log('SELECTED_SONG_SELECTOR:', SELECTED_SONG_SELECTOR);

		if (selectedSongState.value) {
			Session.set('selected_song', selectedSongState.value);
		}

		var query = AppStates.find();
		query.observeChanges({
			changed: function(id, fields) {
				if (id === SELECTED_SONG_SELECTOR) {
					console.log('changed:', fields);
					Session.set('selected_song', fields.value);
				}
			}
		});
	});

	// client side methods
	Meteor.methods({
		//empty
	});
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
	/*global Npm*/
	Future = Npm.require('fibers/future');

	Meteor.startup(function() {

		if (AppStates.find().count() === 0) {
			//first time running
			AppStates.insert({
				key: 'selected_song',
				value: ''
			});
			console.log('Insert selected_song key');
		}
	});

	Meteor.methods({
		removeAllSongs: function() {
			return Songs.remove({});
		},

		getNctMp3: function(songurl) {
			var res;
			var songInfo = parseNctUrl(songurl);
			console.log(songInfo.name, ' - ', songInfo.id);

			// Set up a future
			var fut = new Future();

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
					stream_url: res.data.stream_url,
					time_added: Date.now()
				});

				// Return the results
				fut['return'](true);
			} else {
				fut['return'](false);
			}

			return fut.wait();
		}
	});
}
// ============================================================================
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
