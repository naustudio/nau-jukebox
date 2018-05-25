/* © 2017 NauStud.io
 * @author Thanh Tran, Tung Tran, Tw
 */
import { Migrations } from 'meteor/percolate:migrations';
import { UserStatus } from 'meteor/mizzao:user-status';
import subDays from 'date-fns/sub_days';

import { slugify } from '../imports/helpers/utils';
import { AppStates, Songs, Users, Rooms, Messages } from '../imports/collections';
import getSongInfoNct from '../imports/parsers/getSongInfoNct';
import getSongInfoZing from '../imports/parsers/getSongInfoZing';
import getSongInfoSoundcloud from '../imports/parsers/getSongInfoSoundcloud';
import getSongInfoYouTube from '../imports/parsers/getSongInfoYouTube';

const cacheLatestSong = {};

Meteor.startup(() => {
	// migrate database
	Migrations.migrateTo('latest');

	// On server startup, create initial appstates if the database is empty.
	if (AppStates.find({ key: 'playingSongs' }).count() === 0) {
		//first time running
		AppStates.insert({
			key: 'playingSongs',
			songs: [],
		});
		console.log('Insert AppStates.playingSongs key');
	}
});

UserStatus.events.on('connectionLogout', function(fields) {
	Users.update(fields.userId, { $set: { playing: null } });
});

Meteor.methods({
	getSongInfo(songUrl, authorId, roomId) {
		const regexYouTubeId = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i;
		let songURL;
		if (regexYouTubeId.test(songUrl)) {
			const songId = songUrl.match(regexYouTubeId)[1];
			songURL = `https://www.youtube.com/watch?v=${songId}`;
		} else {
			songURL = songUrl;
		}
		if (cacheLatestSong[roomId] && cacheLatestSong[roomId].songUrl === songURL) {
			throw new Meteor.Error(403, 'This song is already booked');
		}

		// Set up a future for async callback sending to clients
		let songInfo;

		if (String(songURL).includes('nhaccuatui')) {
			console.log('Getting NCT song info');
			songInfo = getSongInfoNct(songURL);
		} else if (String(songURL).includes('mp3.zing')) {
			console.log('Getting Zing song info');
			songInfo = getSongInfoZing(songURL);
		} else if (String(songURL).includes('soundcloud')) {
			console.log('Getting Soundclound song info');
			songInfo = getSongInfoSoundcloud(songURL);
		} else if (String(songURL).includes('youtube')) {
			console.log('Getting YouTube song info');
			songInfo = getSongInfoYouTube(songURL);
		}

		if (songInfo && songInfo.streamURL) {
			songInfo.author = authorId;
			songInfo.roomId = roomId;
			songInfo.searchPattern = `${songInfo.name.toLowerCase()} - ${songInfo.artist.toLowerCase()}`;

			return Songs.insert(songInfo, (err, id) => {
				if (err) {
					throw new Meteor.Error(403, err);
				}
				cacheLatestSong[roomId] = {
					songUrl: songURL,
					songId: id,
				};
			});
		}

		Songs.update({ originalURL: songUrl }, { $set: { badSong: true } }, { multi: true }, err => {
			if (err) {
				console.log(err);
			}
		});

		throw new Meteor.Error(403, songInfo ? songInfo.error : 'Invalid URL');
	},

	refetchSongInfo(song) {
		// Set up a future for async callback sending to clients
		let songInfo;

		if (String(song.originalURL).includes('nhaccuatui')) {
			console.log('Getting NCT song info');
			songInfo = getSongInfoNct(song.originalURL);
		} else if (String(song.originalURL).includes('mp3.zing')) {
			console.log('Getting Zing song info');
			songInfo = getSongInfoZing(song.originalURL);
		}

		if (songInfo && songInfo.streamURL) {
			Songs.update(song._id, { $set: { streamURL: songInfo.streamURL, lastFetch: Date.now() } });

			return songInfo.streamURL;
		}

		Songs.update(song._id, { $set: { badSong: true } }, { multi: true }, err => {
			if (err) {
				console.log(err);
			}
		});

		return null;
	},

	removeSong(songId, roomId) {
		if (cacheLatestSong[roomId] && cacheLatestSong[roomId].songId === songId) {
			cacheLatestSong[roomId] = {};
		}

		return Songs.remove(songId);
	},

	createRoom(roomName, userId) {
		const slug = slugify(roomName);
		const room = Rooms.findOne({ slug });
		if (room) {
			throw new Meteor.Error(403, 'This room is already exist');
		}

		return Rooms.insert({
			name: roomName,
			slug,
			createdBy: userId,
			hostId: userId,
		});
	},

	changeHost(userId, roomId) {
		return Rooms.update(roomId, { $set: { hostId: userId } });
	},

	updatePlayingStatus(userId, songId) {
		Users.update(Meteor.userId(), { $set: { playing: songId } });
	},

	removePlayingStatus() {
		Users.update(Meteor.userId(), { $set: { playing: null } });
	},

	updateUserRoom(userId, roomId) {
		const joinedRooms = Users.findOne(userId).joinedRooms || [];

		if (joinedRooms.indexOf(roomId) < 0) {
			joinedRooms.push(roomId);
		}

		return Users.update(userId, {
			$set: {
				roomId,
				joinedRooms,
			},
		});
	},

	naucoinPay(userId, amount) {
		const u = Users.findOne(userId);
		const oldBalance = u.balance || 0;
		const newBalance = oldBalance + parseFloat(amount);

		return Users.update(u._id, {
			$set: {
				balance: newBalance,
			},
		});
	},

	searchSong(searchString) {
		const words = searchString
			.toLowerCase()
			.trim()
			.split(' ');

		return _.uniq(
			Songs.find(
				{
					searchPattern: { $regex: `${words.join('.*?')}`, $options: 'xi' },
					badSong: { $ne: true },
				},
				{
					sort: { timeAdded: -1 }, // show new book first (more likely preferred ones)
					limit: 100, // just a relative limit to reduce DB access overheads
					reactive: false,
				}
			).fetch(),
			false,
			song => song.originalURL.trim()
		);
	},
	toggleSongAuthor(songId, revealed) {
		return Songs.update(songId, { $set: { isRevealed: revealed } });
	},
	sendMessage(message, userId, roomId) {
		return Messages.insert({ createdBy: userId, message, roomId });
	},
});

Meteor.publish('Meteor.users.public', function() {
	const options = {
		fields: {
			status: 1,
			balance: 1,
			profile: 1,
			roomId: 1,
			'services.facebook.id': 1,
			'services.google.picture': 1,
			'services.goalify.avatar': 1,
			playing: 1,
			isHost: 1,
		},
	};

	return Meteor.users.find({}, options);
});

Meteor.publish('userData', function() {
	if (this.userId) {
		return Meteor.users.find(
			{ _id: this.userId },
			{
				fields: {
					status: 1,
					balance: 1,
					playing: 1,
					roomId: 1,
					services: 1,
					profile: 1,
					isHost: 1,
					joinedRooms: 1,
				},
			}
		);
	}

	return this.ready();
});

Meteor.publish('Songs.public', function() {
	const sevenDaysAgo = subDays(new Date(), 8);
	sevenDaysAgo.setHours(0, 0, 0, 0);

	return Songs.find({ timeAdded: { $gt: sevenDaysAgo.getTime() } });
});

Meteor.publish('AppStates.public', function() {
	return AppStates.find({});
});

Meteor.publish('Rooms.public', function() {
	return Rooms.find({});
});

Meteor.publish('Messages.public', function() {
	return Messages.find({});
});
