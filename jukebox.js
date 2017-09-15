/**
 * Main module
 */
/*eslint no-shadow:0*/
/*global Songs:true, AppStates:true, Users:true, SC, moment*/
import { getSongInfoNct } from './imports/parsers/getSongInfoNct.js';
import { getSongInfoZing } from './imports/parsers/getSongInfoZing.js';
import { getSongInfoSoundcloud } from './imports/parsers/getSongInfoSoundcloud.js';
import { getSongInfoYouTube } from './imports/parsers/getSongInfoYouTube.js';
import { JukeboxPlayer } from './imports/player/JukeboxPlayer.js';
import { SongOrigin } from './imports/constants.js';


// Set up a collection to contain song information. On the server,
// it is backed by a MongoDB collection named 'songs'.
Songs = new Meteor.Collection('songs');
AppStates = new Meteor.Collection('appstates');
Users = Meteor.users;

if (Meteor.isClient) {
	Meteor.subscribe('userData'); // needed to get other fields of current user
	Meteor.subscribe('Meteor.users.public'); // needed to get public fields of Users
	Session.setDefault('urlFetching', false);
	Session.setDefault('showAll', false);
	Session.setDefault('tab', 'tab--play-list');
	Session.setDefault('selectedIndex', '0');
	Session.setDefault('USER_LIST', []);
	Session.setDefault('IS_HOST', false);

	var player; // the jukebox player, will be init when clientStartup

	/*global Trianglify*/
	var navbarBackground = function() {
		var rn = Math.floor((Math.random() * 150) + 60);
		var rs = Math.floor((Math.random() * 11) + 4);
		var t = new Trianglify({
			x_gradient: Trianglify.colorbrewer.Spectral[rs],
			noiseIntensity: 0,
			cellsize: rn
		});

		var pattern = t.generate(window.innerWidth, 269);
		document.getElementById('js-navbar')
			.setAttribute('style', 'background-image: ' + pattern.dataUrl);
	};

	var showTab = function(tabId) {
		$('.main-content').css('display', 'none');
		$('#' + tabId).css('display', 'block');
	};

	var showRequireMessage = function() {
		var $playlistNav = $('.js-playlist-section');

		$playlistNav.addClass('_focus').css('top', 69);
		$('.js-login-control').addClass('_error');
	};

	var hideRequireMessage = function() {
		var $playlistNav = $('.js-playlist-section');
		$playlistNav.removeClass('_focus');
		$('.js-login-control').removeClass('_error');

		var songurl = $('[name="songurl"]').val().trim();
		if (songurl) {
			submitSong(songurl);
			$('[name="songurl"]').val('');
		}
	};

	var submitSong = function(songurl) {
		const userId = Meteor.userId();
		console.log('Submit song', userId);
		if (!userId) {
			showRequireMessage();
			return;
		}

		Users.updateStatus(userId);

		Meteor.call('getSongInfo', songurl, userId, function(error/*, result*/) {
			if (error) {
				alert('Cannot add the song at:\n' + songurl + '\nReason: ' + error.reason);
				$('[name="songurl"]').val('');
			}

			// clear input field after inserting has done
			$('[name="songurl"]').val('');
			Session.set('urlFetching', false);
		});
	};

	var mergeData = function() {
		var userList = Session.get('naustorm_author_data');
		var userDataList = Users.find({}).fetch();
		var newUserList;

		newUserList = userList.map(function(item) {
			var user = _.find(userDataList, function(i) {
				return i._id === item.author;
			});
			if (user !== undefined) {
				user.books = item.books;
			}
			return user;
		});

		newUserList = _.sortBy(newUserList, function(i) {
			return -1 * (1000 * (i.isOnline ? 1 : 0)) - (i.balance || 0);
		});

		Session.set('USER_LIST', newUserList);
		return newUserList;
	};

	Template.songlist.helpers({
		songs: function() {
			var tab = Session.get('tab');
			var earlyOfToday = new Date();
			var songList;
			earlyOfToday.setHours(0, 0, 0, 0);

			switch (tab) {
				case 'tab--play-list':
					var today = new Date();
					today.setHours(0, 0, 0, 0); //reset to start of day
					songList = Songs.find({timeAdded: {$gt: today.getTime()}}, {sort: {timeAdded: 1}});
					break;

				case 'tab--yesterday':
					var yesterday = moment().add(-1, 'days').toDate();
					yesterday.setHours(0, 0, 0, 0);
					songList = Songs.find(
						{timeAdded: {$gt: yesterday.getTime(), $lt: earlyOfToday.getTime()}},
						{sort: {timeAdded: 1}}
					);
					break;

				case 'tab--past-7-days':
					var last7Days = moment().add(-7, 'days').toDate();
					last7Days.setHours(0, 0, 0, 0);
					songList = Songs.find(
						{timeAdded: {$gt: last7Days.getTime(), $lt: earlyOfToday.getTime()}},
						{sort: {timeAdded: 1}}
					);
					break;

				case 'tab--naustorm':
				case 'tab--gamblr':
					break;

				default:
					songList = [];
					break;
			}

			return songList;
		},

		loadingHidden: function() {
			return Session.get('urlFetching') ? '' : 'hidden';
		}
	});

	Template.song.helpers({
		authorInfo: function() {
			return Users.findOne(this.author);
		},

		selected: function() {
			return Session.equals('selectedSong', this._id) ? '_selected' : '';
		},

		getDisplayStatus: function() {
			var isHost = Session.get('IS_HOST');
			return (isHost ? '' : 'u-hide');
		},

		playing: function() {
			var playingSongs = AppStates.findOne({key: 'playingSongs'});

			if (playingSongs && Array.isArray(playingSongs.songs)) {
				return (playingSongs.songs.indexOf(this._id) !== -1) ? '_playing' : '';
			} else {
				return '';
			}
		},

		addDate: function() {
			return Template.instance().addDateFromNow.get();
		},

		originBadgeColor: function() {
			var className = 'black';
			switch (this.origin) {
				case SongOrigin.NHACCUATUI:
					className = 'nct';
					break;
				case SongOrigin.ZING:
					className = 'zing';
					break;
				case SongOrigin.SOUNDCLOUD:
					className = 'sc';
					break;
				case SongOrigin.YOUTUBE:
					className = 'yt';
					break;
			}
			return className;
		}
	});

	Template.naustormitem.helpers({
		getStatus: function() {
			return (this.isOnline ? '_active' : '');
		}
	});

	Template.naustormauthoritem.helpers({
		authorInfo: function () {
			return Users.findOne(this.author);
		},

		getStatus: function() {
			return (this.isOnline ? '_active' : '');
		}
	});

	Template.song.created = function() {
		var self = this;

		this.momentTime = moment(this.data.timeAdded);
		this.addDateFromNow = ReactiveVar(this.momentTime.fromNow());

		this.handle = Meteor.setInterval((function() {
			self.addDateFromNow.set(self.momentTime.fromNow());
		}), 1000 * 60);
	};

	Template.song.destroyed = function() {
		Meteor.clearInterval(this.handle);
	};

	Template.naustorm.helpers({
		storms: function() {
			return Session.get('naustorm_data');
		},

		getDisplayStatus: function() {
			var isHost = Session.get('IS_HOST');
			return (isHost ? '' : 'u-hide');
		},

		groupByAuthorData: function() {
			return Session.get('USER_LIST');
		},

		total: function() {
			return Session.get('naustorm_total');
		},

		dateString: function() {
			var startOfWeek = moment().startOf('isoWeek');
			var endOfWeek = moment().endOf('isoWeek');
			var dateStr = startOfWeek.format('MMM Do') + ' - ' + endOfWeek.format('MMM Do');
			return dateStr;
		}
	});
	Template.naustorm.created = function() {};
	Template.naustorm.destroyed = function() {};
	Template.naustorm.onCreated(function() {
		function getNaustormData() {
			var startOfWeek = moment().startOf('isoWeek').toDate();
			var endOfWeek = moment().endOf('isoWeek').toDate();
			var songList;
			var naustorm = [];
			var group;
			var groupByAuthor;
			var groupByAuthorData = [];

			songList = Songs.find(
				{timeAdded: {$gt: startOfWeek.getTime(), $lt: endOfWeek.getTime()}},
				{sort: {timeAdded: 1}}
			).fetch();

			group = _.chain(songList)
				.groupBy('name')
				.sortBy(function(i) {
					return -1 * i.length;
				})
				.slice(0, 8);

			groupByAuthor = _.chain(songList).groupBy('author');

			for (let item in group._wrapped) {
				let g = group._wrapped[item];
				let t = g[0];
				t.listens = g.length;
				naustorm.push(t);
			}

			for (let item in groupByAuthor._wrapped) {
				let g = groupByAuthor._wrapped[item];
				let t = {
					author: g[0].author.length === 0 ? 'The Many-Faced' : g[0].author,
					books: g.length
				};

				groupByAuthorData.push(t);
			}

			Session.set('naustorm_data', naustorm);
			Session.set('naustorm_total', songList.length);
			Session.set('naustorm_author_data', groupByAuthorData);
		}

		// waiting new records from Song collection
		var today = new Date();
		today.setHours(0, 0, 0, 0); //reset to start of day
		var listenderForNaustorm = Songs.find({timeAdded: {$gt: today.getTime()}}, {sort: {timeAdded: 1}});
		listenderForNaustorm.observeChanges({
			added: function(id, docs) {
				getNaustormData();
				mergeData();
			}
		});
	});

	Template.naucoin.helpers({
		dataContext: function() {
			return Users.find({}, { sort: { balance: -1 } });
		},
		getDisplayStatus: function() {
			var isHost = Session.get('IS_HOST');
			return (isHost ? '' : 'u-hide');
		}
	});
	Template.naucoin.events({
		'submit .js-naucoin-submit-btn': function(e) {
			var userId = $(e.currentTarget).find('[name=userName]').val();
			var amount = $(e.currentTarget).find('[name=amount]').val();

			if (!amount || isNaN(amount)) {
				alert('Input value is invalid !');
				$(e.currentTarget).find('[name=amount]').val('');
				console.log('amount', amount);
				return;
			}

			Meteor.call('naucoinPay', userId, amount, function(err, result) {
				$(e.currentTarget).find('[name=amount]').val('');
			});
		}
	});

	Template.naucoinitem.helpers({
		getBalance: function() {
			return (this.balance || 0).toFixed(2);
		},
		getStatus: function() {
			return (this.isOnline ? '_active' : '');
		}
	});

	Template.body.onCreated(function() {
		var userDataChanged = function(id) {
			var u = Users.findOne(id);

			if (u._id === Meteor.userId()) {
				if (u.isHost) {
					Session.set('IS_HOST', true);
				} else {
					Session.set('IS_HOST', false);
				}
			}
		};

		var userList = Users.find();
		userList.observeChanges({
			added: function(id, data) {
				userDataChanged(id);
			},
			changed: function(id, data) {
				// console.log('user changed', id, data);
				userDataChanged(id);
			}
		});
		// update host status
	});

	Template.body.onRendered(() => {
		// watch login state
		Tracker.autorun(function () {
			if (Meteor.userId()) {
				// user logged in
				console.log('User just logged in');
				hideRequireMessage();
			}
		});
	});

	Template.body.helpers({
		isHost: function() {
			return Session.get('IS_HOST');
		},

		searchResult: function() {
			var searchResult = Session.get('searchResult') || [];
			var selectedIndex = Session.get('selectedIndex');

			if (selectedIndex >= 0 && selectedIndex < searchResult.length) {
				searchResult[selectedIndex]._active = '_active';
			}

			return searchResult;
		}
	});

	Template.songlist.events({
		'click #songurl': function(event) {
			event.currentTarget.select();
		}
	});

	Template.song.events({
		'click .js-song-item': function() {
			player.selectSong(this);
		},

		'click .remove-btn': function(e) {
			Songs.remove(this._id);
			if (Session.equals('selectedSong', this._id)) {
				//selected song playing
				player.pause();
			}
			e.stopPropagation();
		},

		'click .js-show-book-user': function(e) {
			const isUpToggled = !this.isUp;
			Songs.update(this._id, {
				$set: {
					isUp: isUpToggled
				}
			});
		},

		'click .rebook-btn': function(e) {
			// add current url into input field
			$('[name="songurl"]').val(this.originalURL);
			// turn on flag of fetching data
			Session.set('urlFetching', true);
			//call server
			submitSong(this.originalURL);
			e.stopPropagation();
		},

		'click .lyric-modal-toggle': function(e) {
			$('.js-lyric-modal-song-title').html(this.name);
			if (this.lyric) {
				$('.js-lyric-modal-song-lyric').html(this.lyric);
			} else {
				$('.js-lyric-modal-song-lyric').html('Sorry there is no lyric for this song');
			}
			$('.lyric-modal').addClass('active');
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
		},

		'submit #js-add-song-form': function(event) {
			if (!$('[name="songurl"]').val().trim()) {
				return;
			}

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

			//call server
			if (songurl.indexOf('http') >= 0) {
				submitSong(songurl);
			}
		},

		'click .js-play-button': function(event) {
			var $playButton = $(event.currentTarget);
			console.log('$playButton', $playButton.hasClass('_play'));
			if ($playButton.hasClass('_play')) {
				player.play();
			} else {
				player.pause();
			}
		},

		'click .js-playlist-nav': function(event) {
			var $this = $(event.currentTarget);
			var tab = $this.attr('data-tab');

			Session.set('tab', tab);
			showTab($this.attr('data-target'));
			$this.closest('.playlist-nav--list').find('.playlist-nav--item').removeClass('_active');
			$this.addClass('_active');
		},

		/* TODO: Remove this, we're using oauth */
		'keydown .js-nickname-holder': function(e) {
			if (e.keyCode !== 13) { return; }

			var $target = $(e.currentTarget);
			var value = $target.val().trim();

			localStorage.setItem('nickname', value);
			Session.set('nickname', value);
			Users.addOrUpdate(value); // deprecated

			$target.blur();
			hideRequireMessage();
		},

		/* TODO: Remove this, we're using oauth */
		'focusout .js-nickname-holder': function(e) {
			var $target = $(e.currentTarget);
			var value = $target.val().trim();

			$target.val(value);
			localStorage.setItem('nickname', value);
			Session.set('nickname', value);

			hideRequireMessage();
		},

		'keyup .js-search-box': function(e) {
			e.stopPropagation();
			e.preventDefault();

			var $target = $(e.currentTarget);
			var $form = $target.closest('.js-add-song-form');
			var value = $target.val();
			var searchResult = Session.get('searchResult') || [];
			var selectedIndex = Session.get('selectedIndex');
			if (selectedIndex > (searchResult.length - 1)) {
				selectedIndex = searchResult.length - 1;
				Session.set('selectedIndex', selectedIndex.toString());
			}

			if (e.keyCode === 38) { // up arrow
				if (selectedIndex > 0) {
					selectedIndex--;
					Session.set('selectedIndex', selectedIndex.toString());
					return;
				}
			}

			if (e.keyCode === 40) { // down arrow
				if (selectedIndex < (searchResult.length - 1)) {
					selectedIndex++;
					Session.set('selectedIndex', selectedIndex.toString());
					return;
				}
			}

			if (e.keyCode === 27) { // esc
				$target.val('');
				$form.removeClass('_active');

				if (value.length === 0) {
					$form.find('input').blur();
				}
				return;
			}

			if (e.keyCode === 13) { // enter
				var selectedSong = searchResult[selectedIndex];
				if (selectedSong) {
					$form.find('#songurl').val(selectedSong.originalURL);
					submitSong(selectedSong.originalURL);
					$form.find('#songurl').blur();
					$form.removeClass('_active');
					Session.set('searchResult', []);
					return false;
				}
			}

			var data = [];
			var activeSearchResult = function(isSoundcloud) {
				if (data.length > 0) {
					// remove duplicated songs
					if (!isSoundcloud) {
						data = _.uniq(data, false, function(song) {
							return song.searchPattern;
						});
						data = _.first(data, 20);
					}

					Session.set('searchResult', data);
					$form.addClass('_active');
				} else {
					Session.set('searchResult', []);
					$form.removeClass('_active');
				}
			};

			if (value.indexOf('sc:') === 0) {
				var newq = value.substr(3);

				SC.get('/tracks', {
					q: newq,
					limit: 10,
				}).then(function(tracks) {
					data = tracks.map(function(item) {
						return {
							originalURL: item.permalink_url,
							name: item.title,
							artist: item.genre
						};
					});
					activeSearchResult(true);
				});
			} else {
				if (value.length >= 3) {
					data = Songs.find({
						searchPattern: {$regex: value.toLowerCase() + '*'},
					}, {
						limit: 50, // we remove duplicated result and limit further
						reactive: false
					}).fetch();
					activeSearchResult();
				} else {
					$form.removeClass('_active');
				}
			}
		},

		'click .js-song-result--item': function(e) {
			var $target = $(e.currentTarget);
			var $form = $target.closest('.js-add-song-form');
			var songurl = $target.attr('data-href');

			$form.find('#songurl').val('');
			$form.removeClass('_active');

			//call server
			submitSong(songurl);
		},

		'click .js-lyric-modal-close': function(e) {
			$('.lyric-modal').removeClass('active');
		},

		'click .js-lyric-modal': function(e) {
			var $target = $(e.target);
			if ($target.closest('.lyric-modal-inner').length === 0) {
				$target.removeClass('active');
			}
		},
	});

	Meteor.startup(function() {

		player = new JukeboxPlayer();

		var selected = Songs.findOne(Session.get('selectedSong'));
		if (selected) {
			player.selectSong(selected, true); //select but stop
		}

		navbarBackground();
		Meteor.setInterval(navbarBackground, 60000);
		// update online status every minutes
		var updateOnlineStatus = function() {
			var userId = Meteor.userId();
			Meteor.call('updateStatus', userId, function(err, result) {
				console.log('updateStatus', userId, err, result);
			});
		};
		updateOnlineStatus();
		Meteor.setInterval(updateOnlineStatus, 60000);

		$('.js-search-box').on('focus', function(e) {
			var $form = $('.js-add-song-form');
			$form.addClass('_focus');
		});

		$('.js-search-box').on('focusout', function(e) {
			var $form = $('.js-add-song-form');
			$form.removeClass('_focus');
		});

		$(document).on('keyup', function(e) {
			var $form = $('.js-add-song-form');
			var $input = $form.find('input');

			switch (e.keyCode) {
				case 81: // q
					$input.focus();
					break;

				case 27: // esc
					$input.blur();
					$input.val('');
					$form.removeClass('_active');
					break;

				case 80: // p
					// toggle between play/pause
					//
					break;
				default:
			}
		});

		// on scrolling
		var oldScrollTop = 0;
		var headerHeight = 70;
		var playlistHeight = 55;
		var $playlist = $('.playlist-nav');

		$(document).on('scroll', function(e) {
			var newScrollTop = $(this).scrollTop();
			var pos = parseInt($playlist.css('top'), 10);
			var delta = Math.abs(newScrollTop - oldScrollTop);

			if (newScrollTop > oldScrollTop) {
				// scrolling down
				if (pos - delta < (headerHeight - playlistHeight)) {
					$playlist.css('top', headerHeight - playlistHeight);
				} else {
					$playlist.css('top', pos - delta);
				}
			} else {
				// scrolling up
				if (pos + delta > headerHeight) {
					$playlist.css('top', headerHeight);
				} else {
					$playlist.css('top', pos + delta);
				}
			}

			oldScrollTop = newScrollTop;
		});

		// Host register
		$('.js-dot').on('click', function(e) {
			var $loader = $(this).closest('.loader');
			if ($loader.hasClass('_active')) {
				$loader.removeClass('_active');
				// remove all host
				Meteor.call('changeHost', null, function(err) {
					// handle error here
					console.log('all host removed, errs:', err);
				});
			} else {
				var passcode = prompt('Passcode for host is: Nau\'s birthday (6 digits)', '');
				if (passcode.toLowerCase() === '110114') {
					var userId = Meteor.userId();
					if (!userId) {
						showRequireMessage();
						return;
					}
					$loader.addClass('_active');
					Meteor.call('changeHost', userId, function(err) {
						// handle error here
						console.log('changeHost done, errs:', err);
					});
				}
			}
		});
	}); // end Meteor.startup

}

if (Meteor.isServer) {
	var Future = Npm.require('fibers/future');

	Meteor.startup(function() {
		// migrate database
		Migrations.migrateTo('latest');

		// On server startup, create initial appstates if the database is empty.
		if (AppStates.find({key: 'playingSongs'}).count() === 0) {
			//first time running
			AppStates.insert({
				key: 'playingSongs',
				songs: []
			});
			console.log('Insert AppStates.playingSongs key');
		}

		Meteor.setInterval(function() {
			var passAMinute = moment().add(-90, 'seconds').toDate();
			Users.update({lastModified: {$lt: passAMinute}}, {
				$set: {
					isOnline: false
				}
			}, {multi: true});
			console.log('Checking online status was run at: ', new Date());
		}, 90000);
	});

	Meteor.methods({

		getSongInfo: function(songurl, author) {
			// Set up a future for async callback sending to clients
			var songInfo;
			var fut = new Future();

			if (String(songurl).contains('nhaccuatui')) {
				console.log('Getting NCT song info');
				songInfo = getSongInfoNct(songurl);
			} else if (String(songurl).contains('mp3.zing')) {
				console.log('Getting Zing song info');
				songInfo = getSongInfoZing(songurl);
			} else if (String(songurl).contains('soundcloud')) {
				console.log('Getting Soundclound song info');
				songInfo = getSongInfoSoundcloud(songurl);
			} else if (String(songurl).contains('youtube')) {
				console.log('Getting YouTube song info');
				songInfo = getSongInfoYouTube(songurl);
			}

			songInfo.author = author;

			if (songInfo.streamURL) {
				songInfo.searchPattern = songInfo.name.toLowerCase() + ' - ' + songInfo.artist.toLowerCase();
				fut['return'](Songs.insert(songInfo));
			} else {
				fut['return'](null);
				//songInfo is error object
				throw new Meteor.Error(403, songInfo.error);
			}

			return fut.wait();
		},

		changeHost: function(userId) {
			console.log('changeHost', userId);
			// switch all users isHost off
			Users.update({}, {$set: {isHost: false}}, {multi: true}, () => {
				// then switch sHost
				Users.update(userId, {
					$set: {
						isHost: true,
						lastModified: new Date()
					}
				});
			});
		},

		updateStatus: function(userId) {
			return Users.update(userId, {
				$set: {
					isOnline: true,
					lastModified: new Date()
				}
			});
		},

		naucoinPay: function(userId, amount) {
			var u = Users.findOne(userId);
			var oldBalance = u.balance || 0;
			var newBalance = oldBalance + parseFloat(amount);

			return Users.update(u._id, {
				$set: {
					balance: newBalance
				}
			});
		}
	});

	Meteor.publish('Meteor.users.public', function () {
		const options = {
			fields: { isHost: 1, isOnline: 1, balance: 1 }
		};
		return Meteor.users.find({}, options);
	});

	Meteor.publish('userData', function () {
		if (this.userId) {
			return Meteor.users.find({ _id: this.userId }, {
				fields: { isHost: 1, isOnline: 1, balance: 1 }
			});
		} else {
			this.ready();
		}
	});
}
// ============================================================================

/**
 * String.prototype.contains polyfill
 *
 * @param {String} substr The string to match
 * @return {Boolean} whether the string has the substr
 */
if ( !String.prototype.contains ) {
	String.prototype.contains = function(substr) {
		return String.prototype.indexOf.apply( this, arguments ) !== -1;
	};
}

/**
 * AppStates helper: update playing songs, from any clients
 *
 * NOTE: this is an extremely naive solution to show playing state of songs
 * Any clients will override the playing state and there are high chance
 * playing states are not cleaned up properly
 *
 * This is temporary solution, until I manage to upgrade this app
 * to Meteor 1.2+ and integrate a more sophisticated users managing
 *
 * @param  {String} played  next play song ID
 * @param  {String} stopped previously played, and now stopped song ID
 * @return {void}
 */
AppStates.updatePlayingSongs = function(played, stopped) {
	var playingSongs = AppStates.findOne({key: 'playingSongs'});
	var songs = playingSongs.songs;
	if (!Array.isArray(songs)) {
		songs = playingSongs.songs = [];
	}

	var removedIdx = songs.indexOf(stopped);

	if (removedIdx !== -1) {
		songs.splice(removedIdx, 1);
	}

	if (songs.indexOf(played) === -1) {
		songs.push(played);
	}

	// update the exact document in AppStates collection with new songs array
	AppStates.update(playingSongs._id, {key: 'playingSongs', songs: songs});
};

/**
 * User Model, managing all users
 * @param {String} userName [description]
 * @return {void}
 * @deprecated
 * FIXME: remove me
 */
Users.addOrUpdate = function(userName) {
	if (Users.find({userName: userName}).count() === 0) {
		Users.insert({
			userName: userName,
			isHost: false,
			isOnline: true,
			lastModified: new Date()
		});
	} else {
		var u = Users.findOne({userName: userName});
		Users.update(u._id, {
			$set: {
				isOnline: true,
				lastModified: new Date()
			}
		});
	}
};

Users.updateStatus = function (userId) {
	Users.update(userId, {
		$set: {
			isOnline: true,
			lastModified: new Date()
		}
	});
};
