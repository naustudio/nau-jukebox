/* © 2017 NauStud.io
 * @author Thanh Tran, Tung Tran, Tw
 */
import { Migrations } from 'meteor/percolate:migrations';
import { UserStatus } from 'meteor/mizzao:user-status';
import subDays from 'date-fns/sub_days';

import { slugify } from '../imports/helpers/utils';
import { AppStates, Songs, Users, Rooms } from '../imports/collections';
import getSongInfoNct from '../imports/parsers/getSongInfoNct';
import getSongInfoZing from '../imports/parsers/getSongInfoZing';
import getSongInfoSoundcloud from '../imports/parsers/getSongInfoSoundcloud';
import getSongInfoYouTube from '../imports/parsers/getSongInfoYouTube';

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
	getSongInfo(songurl, authorId, roomId) {
		// Set up a future for async callback sending to clients
		let songInfo;

		if (String(songurl).includes('nhaccuatui')) {
			console.log('Getting NCT song info');
			songInfo = getSongInfoNct(songurl);
		} else if (String(songurl).includes('mp3.zing')) {
			console.log('Getting Zing song info');
			songInfo = getSongInfoZing(songurl);
		} else if (String(songurl).includes('soundcloud')) {
			console.log('Getting Soundclound song info');
			songInfo = getSongInfoSoundcloud(songurl);
		} else if (String(songurl).includes('youtube')) {
			console.log('Getting YouTube song info');
			songInfo = getSongInfoYouTube(songurl);
		}

		if (songInfo && songInfo.streamURL) {
			songInfo.author = authorId;
			songInfo.roomId = roomId;
			songInfo.searchPattern = `${songInfo.name.toLowerCase()} - ${songInfo.artist.toLowerCase()}`;

			return Songs.insert(songInfo);
		}

		if (songInfo && songInfo.error) {
			Songs.update({ originalURL: songurl }, { $set: { badSong: true } }, { multi: true }, err => {
				if (err) {
					console.log(err);
				}
			});
		}

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

		if (songInfo && songInfo.error) {
			Songs.update(song._id, { $set: { badSong: true } }, { multi: true }, err => {
				if (err) {
					console.log(err);
				}
			});
		}

		return null;
	},

	createRoom(roomName, userId) {
		return Rooms.insert({
			name: roomName,
			slug: slugify(roomName),
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
		return Users.update(userId, {
			$set: {
				roomId,
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

	searchSong(searchString, roomId) {
		return _.uniq(
			Songs.find(
				{
					searchPattern: { $regex: `${searchString.toLowerCase()}*` },
					roomId,
					badSong: { $ne: true },
				},
				{
					limit: 50, // we remove duplicated result and limit further
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
				fields: { status: 1, balance: 1, playing: 1, roomId: 1, services: 1, profile: 1, isHost: 1 },
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
