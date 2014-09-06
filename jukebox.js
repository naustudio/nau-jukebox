/**
 * Main module
 */
/*global Songs:true, AppStates:true*/

// Set up a collection to contain song information. On the server,
// it is backed by a MongoDB collection named 'songs'.
Songs = new Meteor.Collection('songs');
AppStates = new Meteor.Collection('appstates');

if (Meteor.isClient) {
	Session.setDefault('urlFetching', false);

	var SELECTED_SONG_SELECTOR;
	var player; //the MediaElement instance

	Template.songlist.songs = function() {
		return Songs.find({}, {sort: {timeAdded: 1}});
	};

	Template.songlist.loadingHidden = function() {
		return Session.get('urlFetching') ? '' : 'hidden';
	};

	Template.song.selected = function() {
		return Session.equals('selectedSong', this._id) ? 'selected' : '';
	};

	Template.song.originBadgeColor = function() {
		var color = 'black';
		switch (this.origin) {
			case 'NCT':
				color = 'nct';
				break;
			case 'Zing':
				color = 'zing';
				break;
		}
		return color;
	};

	Template.songlist.events({
		'click #songurl': function(event) {
			event.currentTarget.select();
		},

		'submit #add-song-form': function(event) {

			if (Session.equals('urlFetching', true)) {
				return;
			}

			event.preventDefault();
			var submitData = $(event.currentTarget).serializeArray();
			var songurl;

			Session.set('urlFetching', true);

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

				Session.set('urlFetching', false);
			});
		}
	});

	Template.song.events({
		'click .song-name': function() {
			console.log('to play:', this.streamURL, SELECTED_SONG_SELECTOR);
			AppStates.update(SELECTED_SONG_SELECTOR, {key: 'selectedSong', value: this._id});

			player.pause();
			player.media.src = this.streamURL;
			player.play();
		},
		'click .remove-btn': function(e) {
			Songs.remove(this._id);
			if (Session.equals('selectedSong', this._id)) {
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

			var selectedSongState = AppStates.findOne({key: 'selectedSong'});
			SELECTED_SONG_SELECTOR = selectedSongState._id;
			console.log('SELECTED_SONG_SELECTOR:', SELECTED_SONG_SELECTOR);

			if (selectedSongState.value) {
				Session.set('selectedSong', selectedSongState.value);
			}
		},

		changed: function(id, fields) {
			if (id === SELECTED_SONG_SELECTOR) {
				console.log('changed:', fields);
				Session.set('selectedSong', fields.value);
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
				key: 'selectedSong',
				value: ''
			});
			console.log('Insert selectedSong key');
		}

	});

	Meteor.methods({
		removeAllSongs: function() {
			return Songs.remove({});
		},

		/*global getSongInfoNct, getSongInfoZing*/
		getSongInfo: function(songurl) {
			// Set up a future for async callback sending to clients
			var songInfo;
			var fut = new Future();

			if (String(songurl).contains('nhaccuatui')) {
				console.log('Getting NCT song info');
				songInfo = getSongInfoNct(songurl);
			} else if (String(songurl).contains('mp3.zing')) {
				console.log('Getting Zing song info');
				songInfo = getSongInfoZing(songurl);
			}

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