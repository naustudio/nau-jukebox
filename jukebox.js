/**
 * Main module
 */
/*eslint no-shadow:0, no-undef:0*/
/*global AppStates:true*/

// Set up a collection to contain song information. On the server,
// it is backed by a MongoDB collection named 'songs'.
Songs = new Meteor.Collection('songs');
AppStates = new Meteor.Collection('appstates');
Users = Meteor.users;


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
	const playingSongs = AppStates.findOne({ key: 'playingSongs' });
	let songs = playingSongs.songs;
	if (!Array.isArray(songs)) {
		songs = playingSongs.songs = [];
	}

	const removedIdx = songs.indexOf(stopped);

	if (removedIdx !== -1) {
		songs.splice(removedIdx, 1);
	}

	if (songs.indexOf(played) === -1) {
		songs.push(played);
	}

	// update the exact document in AppStates collection with new songs array
	AppStates.update(playingSongs._id, { key: 'playingSongs', songs });
};
