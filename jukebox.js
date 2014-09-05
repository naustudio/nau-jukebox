/**
 * Main module
 */
/*global Songs:true, AppStates:true*/

// Set up a collection to contain song information. On the server,
// it is backed by a MongoDB collection named 'songs'.
Songs = new Meteor.Collection('songs');
AppStates = new Meteor.Collection('appstates');

if (Meteor.isClient) {
	Session.setDefault('url_fetching', false);

	var SELECTED_SONG_SELECTOR;
	var player; //the MediaElement instance

	Template.songlist.songs = function() {
		return Songs.find({}, {sort: {time_added: 1}});
	};

	Template.songlist.loading_hidden = function() {
		return Session.get('url_fetching') ? '' : 'hidden';
	};

	Template.song.selected = function() {
		return Session.equals('selected_song', this._id) ? 'selected' : '';
	};

	Template.songlist.events({
		'click #songurl': function(event) {
			event.currentTarget.select();
		},

		'submit #add-song-form': function(event) {

			if (Session.equals('url_fetching', true)) {
				return;
			}

			event.preventDefault();
			var submitData = $(event.currentTarget).serializeArray();
			var songurl;

			Session.set('url_fetching', true);

			for (var i = 0; i < submitData.length; i++) {
				if (submitData[i].name === 'songurl') {
					songurl = submitData[i].value;
				}
			}
			// alert('Song list add ' + songurl);

			//call server
			Meteor.call('getSongInfo', songurl, function(error, result) {
				console.log('getSongInfo callback:', result);
				if (!result) {
					alert('Cannot add the song at:\n' + songurl);
					this.$('#songurl').val('');
				}

				Session.set('url_fetching', false);
			});
		}
	});

	Template.song.events({
		'click .song-name': function() {
			console.log('to play:', this.streamURL, SELECTED_SONG_SELECTOR);
			AppStates.update(SELECTED_SONG_SELECTOR, {key: 'selected_song', value: this._id});

			player.pause();
			player.media.src = this.streamURL;
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

	});

	AppStates.find().observeChanges({
		added: function(/*id, fields*/) {
			// console.log('AppSate added:', fields);

			var selectedSongState = AppStates.findOne({key: 'selected_song'});
			SELECTED_SONG_SELECTOR = selectedSongState._id;
			console.log('SELECTED_SONG_SELECTOR:', SELECTED_SONG_SELECTOR);

			if (selectedSongState.value) {
				Session.set('selected_song', selectedSongState.value);
			}
		},

		changed: function(id, fields) {
			if (id === SELECTED_SONG_SELECTOR) {
				console.log('changed:', fields);
				Session.set('selected_song', fields.value);
			}
		}
	});
}

if (Meteor.isServer) {
	var Future = Npm.require('fibers/future');

	Meteor.startup(function() {

		// On server startup, create initial appstates if the database is empty.
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

		/*global getNctSongInfo*/
		getSongInfo: function(songurl) {
			// Set up a future for async callback sending to clients
			var songInfo;
			var fut = new Future();

			if (String(songurl).contains('nhaccuatui')) {
				songInfo = getNctSongInfo(songurl);
			} // else, unsupported link

			if (songInfo) {
				fut['return'](Songs.insert(songInfo));
			} else {
				fut['return'](null);
			}

			return fut.wait();
		}
	});
}
// ============================================================================

/**
 * String.prototype.contains polyfill
 */
if ( !String.prototype.contains ) {
    String.prototype.contains = function() {
        return String.prototype.indexOf.apply( this, arguments ) !== -1;
    };
}