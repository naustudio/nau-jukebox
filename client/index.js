/* © 2017 NauStud.io
 * @author Thanh Tran, Tung Tran, Tw
 */
/*global Songs:true, AppStates:true, Users:true, SC, moment*/
import { JukeboxPlayer } from '../imports/player/JukeboxPlayer.js';
import { SongOrigin } from '../imports/constants.js';

// Data subscription
Meteor.subscribe('userData'); // needed to get other fields of current user
Meteor.subscribe('Meteor.users.public'); // needed to get public fields of Users
// Session defaults
Session.setDefault('urlFetching', false);
Session.setDefault('showAll', false);
Session.setDefault('tab', 'tab--play-list');
Session.setDefault('selectedIndex', '0');
Session.setDefault('USER_LIST', []);
Session.setDefault('IS_HOST', false);

let player; // the jukebox player, will be init when clientStartup

/*global Trianglify*/
const navbarBackground = () => {
	const rn = Math.floor((Math.random() * 150) + 60);
	const rs = Math.floor((Math.random() * 11) + 4);
	const t = new Trianglify({
		x_gradient: Trianglify.colorbrewer.Spectral[rs],
		noiseIntensity: 0,
		cellsize: rn
	});

	const pattern = t.generate(window.innerWidth, 269);
	document.getElementById('js-navbar')
		.setAttribute('style', `background-image: ${pattern.dataUrl}`);
};

const showTab = tabId => {
	$('.main-content').css('display', 'none');
	$(`#${tabId}`).css('display', 'block');
};

const showRequireMessage = () => {
	const $playlistNav = $('.js-playlist-section');

	$playlistNav.addClass('_focus').css('top', 69);
	$('.js-login-control').addClass('_error');
};

const hideRequireMessage = () => {
	const $playlistNav = $('.js-playlist-section');
	$playlistNav.removeClass('_focus');
	$('.js-login-control').removeClass('_error');

	const songurl = $('[name="songurl"]').val().trim();
	if (songurl) {
		submitSong(songurl);
		$('[name="songurl"]').val('');
	}
};

var submitSong = songurl => {
	const userId = Meteor.userId();
	console.log('Submit song', userId);
	if (!userId) {
		showRequireMessage();
		return;
	}

	Meteor.call('getSongInfo', songurl, userId, error/*, result*/ => {
		if (error) {
			alert(`Cannot add the song at:\n${songurl}\nReason: ${error.reason}`);
			$('[name="songurl"]').val('');
		}

		// clear input field after inserting has done
		$('[name="songurl"]').val('');
		Session.set('urlFetching', false);
	});
};

const mergeData = () => {
	const userList = Session.get('naustorm_author_data');
	const userDataList = Users.find({}).fetch();
	let newUserList;

	newUserList = userList.map(item => {
		const user = _.find(userDataList, i => i._id === item.author);
		if (user !== undefined) {
			user.books = item.books;
		}
		return user;
	});

	newUserList = _.sortBy(newUserList, i => -1 * (1000 * (i.isOnline ? 1 : 0)) - (i.balance || 0));

	Session.set('USER_LIST', newUserList);
	return newUserList;
};

Template.songlist.helpers({
	songs() {
		const tab = Session.get('tab');
		const earlyOfToday = new Date();
		let songList;
		earlyOfToday.setHours(0, 0, 0, 0);

		switch (tab) {
			case 'tab--play-list':
				const today = new Date();
				today.setHours(0, 0, 0, 0); //reset to start of day
				songList = Songs.find({timeAdded: {$gt: today.getTime()}}, {sort: {timeAdded: 1}});
				break;

			case 'tab--yesterday':
				const yesterday = moment().add(-1, 'days').toDate();
				yesterday.setHours(0, 0, 0, 0);
				songList = Songs.find(
					{timeAdded: {$gt: yesterday.getTime(), $lt: earlyOfToday.getTime()}},
					{sort: {timeAdded: 1}}
				);
				break;

			case 'tab--past-7-days':
				const last7Days = moment().add(-7, 'days').toDate();
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

	loadingHidden() {
		return Session.get('urlFetching') ? '' : 'hidden';
	}
});

Template.song.helpers({
	authorInfo() {
		return Users.findOne(this.author);
	},

	selected() {
		return Session.equals('selectedSong', this._id) ? '_selected' : '';
	},

	getDisplayStatus() {
		const isHost = Session.get('IS_HOST');
		return (isHost ? '' : 'u-hide');
	},

	playing() {
		const playingSongs = AppStates.findOne({key: 'playingSongs'});

		if (playingSongs && Array.isArray(playingSongs.songs)) {
			return (playingSongs.songs.includes(this._id)) ? '_playing' : '';
		} else {
			return '';
		}
	},

	addDate() {
		return Template.instance().addDateFromNow.get();
	},

	visible() {
		// this variable will tick every minute and hide old entries when player runs to new day
		return Template.instance().visible.get() ? '' : 'u-hide';
	},

	originBadgeColor() {
		let className = 'black';
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
	getStatus() {
		return (this.isOnline ? '_active' : '');
	}
});

Template.naustormauthoritem.helpers({
	authorInfo() {
		return Users.findOne(this.author);
	},

	getStatus() {
		return (this.isOnline ? '_active' : '');
	}
});

Template.song.created = function() {
	const self = this;

	this.momentTime = moment(this.data.timeAdded);
	this.addDateFromNow = ReactiveVar(this.momentTime.fromNow());
	this.visible = ReactiveVar(true);

	this.handle = Meteor.setInterval((() => {
		self.addDateFromNow.set(self.momentTime.fromNow());
		if (!self.momentTime.isSameOrAfter(new Date(), 'day')) {
			// not today?, hide self
			this.visible.set(false);
		}

	}), 1000 * 60);
};

Template.song.destroyed = function() {
	Meteor.clearInterval(this.handle);
};

Template.naustorm.helpers({
	storms() {
		return Session.get('naustorm_data');
	},

	getDisplayStatus() {
		const isHost = Session.get('IS_HOST');
		return (isHost ? '' : 'u-hide');
	},

	groupByAuthorData() {
		return Session.get('USER_LIST');
	},

	total() {
		return Session.get('naustorm_total');
	},

	dateString() {
		const startOfWeek = moment().startOf('isoWeek');
		const endOfWeek = moment().endOf('isoWeek');
		const dateStr = `${startOfWeek.format('MMM Do')} - ${endOfWeek.format('MMM Do')}`;
		return dateStr;
	}
});
Template.naustorm.created = () => {};
Template.naustorm.destroyed = () => {};
Template.naustorm.onCreated(() => {
	function getNaustormData() {
		const startOfWeek = moment().startOf('isoWeek').toDate();
		const endOfWeek = moment().endOf('isoWeek').toDate();
		let songList;
		const naustorm = [];
		let group;
		let groupByAuthor;
		const groupByAuthorData = [];

		songList = Songs.find(
			{timeAdded: {$gt: startOfWeek.getTime(), $lt: endOfWeek.getTime()}},
			{sort: {timeAdded: 1}}
		).fetch();

		group = _.chain(songList)
			.groupBy('name')
			.sortBy(i => -1 * i.length)
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
	const today = new Date();
	today.setHours(0, 0, 0, 0); //reset to start of day
	const listenderForNaustorm = Songs.find({timeAdded: {$gt: today.getTime()}}, {sort: {timeAdded: 1}});
	listenderForNaustorm.observeChanges({
		added(id, docs) {
			getNaustormData();
			mergeData();
		}
	});
});

Template.naucoin.helpers({
	dataContext() {
		return Users.find({}, { sort: { isOnline: -1, balance: -1 } });
	},
	getDisplayStatus() {
		const isHost = Session.get('IS_HOST');
		return (isHost ? '' : 'u-hide');
	}
});
Template.naucoin.events({
	'submit .js-naucoin-submit-btn'(e) {
		const userId = $(e.currentTarget).find('[name=userName]').val();
		const amount = $(e.currentTarget).find('[name=amount]').val();

		if (!amount || isNaN(amount)) {
			alert('Input value is invalid !');
			$(e.currentTarget).find('[name=amount]').val('');
			console.log('amount', amount);
			return;
		}

		Meteor.call('naucoinPay', userId, amount, (err, result) => {
			$(e.currentTarget).find('[name=amount]').val('');
		});
	}
});

Template.naucoinitem.helpers({
	profileImage() {
		let imageURL = '';
		if (this.services) {
			if (this.services.google) {
				imageURL = this.services.google.picture;
			} else if (this.services.facebook) {
				imageURL = `https://graph.facebook.com/v2.10/${this.services.facebook.id}/picture?type=square`;
			}
		} else {
			imageURL = 'https://api.adorable.io/avatar/' + this.profile.name;
		}

		return imageURL;
	},
	isLegacyAccount() {
		return !this.services;
	},
	getBalance() {
		return (this.balance || 0).toFixed(2);
	},
	getStatus() {
		return (this.isOnline ? '_active' : '');
	}
});

Template.body.onCreated(() => {
	const userDataChanged = id => {
		const u = Users.findOne(id);

		if (u._id === Meteor.userId()) {
			if (u.isHost) {
				Session.set('IS_HOST', true);
			} else {
				Session.set('IS_HOST', false);
			}
		}
	};

	const userList = Users.find();
	userList.observeChanges({
		added(id, data) {
			userDataChanged(id);
		},
		changed(id, data) {
			// console.log('user changed', id, data);
			userDataChanged(id);
		}
	});
	// update host status
});

Template.body.onRendered(() => {
	// watch login state
	Tracker.autorun(() => {
		if (Meteor.userId()) {
			// user logged in
			console.log('User just logged in');
			hideRequireMessage();
		}
	});
});

Template.body.helpers({
	isHost() {
		return Session.get('IS_HOST');
	},

	searchResult() {
		const searchResult = Session.get('searchResult') || [];
		const selectedIndex = Session.get('selectedIndex');

		if (selectedIndex >= 0 && selectedIndex < searchResult.length) {
			searchResult[selectedIndex]._active = '_active';
		}

		return searchResult;
	}
});

Template.songlist.events({
	'click #songurl'(event) {
		event.currentTarget.select();
	}
});

Template.song.events({
	'click .js-song-item'() {
		player.selectSong(this);
	},

	'click .remove-btn'(e) {
		Songs.remove(this._id);
		if (Session.equals('selectedSong', this._id)) {
			//selected song playing
			player.pause();
		}
		e.stopPropagation();
	},

	'click .js-show-book-user'(e) {
		const isUpToggled = !this.isUp;
		Songs.update(this._id, {
			$set: {
				isUp: isUpToggled
			}
		});
	},

	'click .rebook-btn'(e) {
		// add current url into input field
		$('[name="songurl"]').val(this.originalURL);
		// turn on flag of fetching data
		Session.set('urlFetching', true);
		//call server
		submitSong(this.originalURL);
		e.stopPropagation();
	},

	'click .lyric-modal-toggle'(e) {
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
	'change #show-all-chk'(event) {
		const checkbox = event.currentTarget;
		if (checkbox.checked) {
			Session.set('showAll', true);
		} else {
			Session.set('showAll', false);
		}
	},

	'submit #js-add-song-form'(event) {
		if (!$('[name="songurl"]').val().trim()) {
			return;
		}

		if (Session.equals('urlFetching', true)) {
			return;
		}

		event.preventDefault();
		const submitData = $(event.currentTarget).serializeArray();
		let songurl;

		Session.set('urlFetching', true);

		for (let i = 0; i < submitData.length; i++) {
			if (submitData[i].name === 'songurl') {
				songurl = submitData[i].value;
			}
		}

		//call server
		if (songurl.includes('http')) {
			submitSong(songurl);
		}
	},

	'click .js-play-button'(event) {
		const $playButton = $(event.currentTarget);
		console.log('$playButton', $playButton.hasClass('_play'));
		if ($playButton.hasClass('_play')) {
			player.play();
		} else {
			player.pause();
		}
	},

	'click .js-playlist-nav'(event) {
		event.preventDefault();
		const $this = $(event.currentTarget);
		const tab = $this.attr('data-tab');

		Session.set('tab', tab);
		showTab($this.attr('data-target'));
		$this.closest('.playlist-nav--list').find('.playlist-nav--item').removeClass('_active');
		$this.addClass('_active');
	},

	'keyup .js-search-box'(e) {
		e.stopPropagation();
		e.preventDefault();

		const $target = $(e.currentTarget);
		const $form = $target.closest('.js-add-song-form');
		const value = $target.val();
		const searchResult = Session.get('searchResult') || [];
		let selectedIndex = Session.get('selectedIndex');
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
			const selectedSong = searchResult[selectedIndex];
			if (selectedSong) {
				$form.find('#songurl').val(selectedSong.originalURL);
				submitSong(selectedSong.originalURL);
				$form.find('#songurl').blur();
				$form.removeClass('_active');
				Session.set('searchResult', []);
				return false;
			}
		}

		let data = [];
		const activeSearchResult = isSoundcloud => {
			if (data.length > 0) {
				// remove duplicated songs
				if (!isSoundcloud) {
					data = _.uniq(data, false, song => song.searchPattern);
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
			const newq = value.substr(3);

			SC.get('/tracks', {
				q: newq,
				limit: 10,
			}).then(tracks => {
				data = tracks.map(item => ({
					originalURL: item.permalink_url,
					name: item.title,
					artist: item.genre
				}));
				activeSearchResult(true);
			});
		} else {
			if (value.length >= 3) {
				data = Songs.find({
					searchPattern: {$regex: `${value.toLowerCase()}*`},
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

	'click .js-song-result--item'(e) {
		const $target = $(e.currentTarget);
		const $form = $target.closest('.js-add-song-form');
		const songurl = $target.attr('data-href');

		$form.find('#songurl').val('');
		$form.removeClass('_active');

		//call server
		submitSong(songurl);
	},

	'click .js-lyric-modal-close'(e) {
		$('.lyric-modal').removeClass('active');
	},

	'click .js-lyric-modal'(e) {
		const $target = $(e.target);
		if ($target.closest('.lyric-modal-inner').length === 0) {
			$target.removeClass('active');
		}
	},
});

Meteor.startup(() => {

	player = new JukeboxPlayer();

	const selected = Songs.findOne(Session.get('selectedSong'));
	if (selected) {
		player.selectSong(selected, true); //select but stop
	}

	navbarBackground();
	Meteor.setInterval(navbarBackground, 60000);
	// update online status every minutes
	const updateOnlineStatus = () => {
		const userId = Meteor.userId();
		Meteor.call('updateStatus', userId, (err, result) => {
			console.log('updateStatus', userId, err, result);
		});
	};
	updateOnlineStatus();
	Meteor.setInterval(updateOnlineStatus, 60000);

	$('.js-search-box').on('focus', e => {
		const $form = $('.js-add-song-form');
		$form.addClass('_focus');
	});

	$('.js-search-box').on('focusout', e => {
		const $form = $('.js-add-song-form');
		$form.removeClass('_focus');
	});

	$(document).on('keyup', e => {
		const $form = $('.js-add-song-form');
		const $input = $form.find('input');

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
	let oldScrollTop = 0;
	const headerHeight = 70;
	const playlistHeight = 55;
	const $playlist = $('.playlist-nav');

	$(document).on('scroll', function(e) {
		const newScrollTop = $(this).scrollTop();
		const pos = parseInt($playlist.css('top'), 10);
		const delta = Math.abs(newScrollTop - oldScrollTop);

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
		const $loader = $(this).closest('.loader');
		if ($loader.hasClass('_active')) {
			$loader.removeClass('_active');
			// remove all host
			Meteor.call('changeHost', null, err => {
				// handle error here
				console.log('all host removed, errs:', err);
			});
		} else {
			const passcode = prompt('Passcode for host is: Nau\'s birthday (6 digits)', '');
			if (passcode.toLowerCase() === '110114') {
				const userId = Meteor.userId();
				if (!userId) {
					showRequireMessage();
					return;
				}
				$loader.addClass('_active');
				Meteor.call('changeHost', userId, err => {
					// handle error here
					console.log('changeHost done, errs:', err);
				});
			}
		}
	});
}); // end Meteor.startup
