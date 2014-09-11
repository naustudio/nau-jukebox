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
	Session.setDefault('showAll', false);

	var SELECTED_SONG_SELECTOR;
	var player; //the MediaElement instance

	Template.songlist.songs = function() {
		if (Session.get('showAll')) {
			return Songs.find({}, {sort: {timeAdded: 1}});
		} else {
			var today = new Date();
			today.setHours(0, 0, 0, 0); //reset to start of day
			return Songs.find({timeAdded: {$gt: today.getTime()}}, {sort: {timeAdded: 1}});
		}
	};

	Template.songlist.loadingHidden = function() {
		return Session.get('urlFetching') ? '' : 'hidden';
	};

	Template.song.selected = function() {
		return Session.equals('selectedSong', this._id) ? 'selected' : '';
	};

	Template.song.addDate = function() {
		var date = new Date(this.timeAdded);
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();

		if (m < 10) { m = '0' + m};
		if (d < 10) { d = '0' + d};

		return y + '-' + m + '-' + d;
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
		'click .song-item': function() {
			playSong(this);
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

	Template.player.events({
		// event dispatched from the audio element
		'ended #audio-player': function() {
			console.log('Audio ended for:', player.song.name);
			var nextSong = Songs.findOne({timeAdded: {$gt: player.song.timeAdded}});

			if (nextSong) {
				//delay some time so that calling play on the next song can work
				setTimeout(function() {
					playSong(nextSong);
				}, 60);
			} else {
				console.log('No more song to play');
			}
		}
	});

	Template.body.events({
		'change #show-all-chk': function(event) {
			var checkbox = event.currentTarget;
			if (checkbox.checked) {
				Session.set('showAll', true);
			} else {
				Session.set('showAll', false);
			}
		}
	});

	/*global MediaElementPlayer*/
	Meteor.startup(function() {
		// init the media player
		player = new MediaElementPlayer('#audio-player');
		var selected = Songs.findOne(Session.get('selectedSong'));
		if (selected) {
			selectSong(selected);
		}
	});

	AppStates.find().observeChanges({
		added: function(/*id, fields*/) {
			// console.log('AppSate added:', fields);

			var selectedSongState = AppStates.findOne({key: 'selectedSong'});
			SELECTED_SONG_SELECTOR = selectedSongState._id;
			console.log('SELECTED_SONG_SELECTOR:', SELECTED_SONG_SELECTOR);

			if (selectedSongState.value) {
				Session.set('selectedSong', selectedSongState.value);
				selectSong(Songs.findOne(selectedSongState.value));
			}
		},

		changed: function(id, fields) {
			if (id === SELECTED_SONG_SELECTOR) {
				console.log('Selected song changed:', fields);
				Session.set('selectedSong', fields.value);
				selectSong(Songs.findOne(fields.value));
			}
		}
	});

	/**
	 * Keep the media player have a selected song ready to play
	 * @param  {[type]} song [description]
	 * @return {[type]}      [description]
	 */
	function selectSong(song) {
		if (player) {
			player.pause();
			player.media.src = song.streamURL;
			player.song = song;
			document.title = 'NJ :: ' + song.name;
		}
	}

	/**
	 * Actually play the song
	 * @param  {[type]} song [description]
	 * @return {[type]}      [description]
	 */
	function playSong(song) {
		console.log('to play:', song.name);

		AppStates.update(SELECTED_SONG_SELECTOR, {key: 'selectedSong', value: song._id});
		selectSong(song);
		player.play();
	}
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