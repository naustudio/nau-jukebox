/* © 2017 NauStud.io
 * @author Thanh Tran
 */
/*global Songs:true, AppStates:true, Users:true, moment*/
import { getSongInfoNct } from '../imports/parsers/getSongInfoNct.js';
import { getSongInfoZing } from '../imports/parsers/getSongInfoZing.js';
import { getSongInfoSoundcloud } from '../imports/parsers/getSongInfoSoundcloud.js';
import { getSongInfoYouTube } from '../imports/parsers/getSongInfoYouTube.js';

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

	getSongInfo: function(songurl, authorId) {
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

		songInfo.author = authorId;

		if (songInfo.streamURL) {
			songInfo.searchPattern = songInfo.name.toLowerCase() + ' - ' + songInfo.artist.toLowerCase();
			fut['return'](Songs.insert(songInfo));
		} else {
			fut['return'](null);
			//songInfo is error object
			throw new Meteor.Error(403, songInfo.error);
		}

		Meteor.call('updateStatus', authorId, function(err, result) {
			console.log('updateStatus', authorId, err, result);
		});

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
