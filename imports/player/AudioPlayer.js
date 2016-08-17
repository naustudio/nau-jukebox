/*global MediaElementPlayer*/

/**
 * This wraps the basic media element player
 */
export class AudioPlayer {

	constructor(mainPlayer) {
		this.player = new MediaElementPlayer('#audio-player');
		this.song = null;

		Template.player.events({
			// 'playing #audio-player': function() {
			// 	AppStates.updatePlayingSongs(Session.get('selectedSong'));
			// },

			// 'pause #audio-player': function() {
			// 	// remove from playing songs list
			// 	AppStates.updatePlayingSongs('', Session.get('selectedSong'));
			// },
			// event dispatched from the audio element
			'ended #audio-player': function() {
				console.log('Audio ended for:', mainPlayer.currentSong.name);
				mainPlayer.playNext();
			}
		});
	}

	play(song) {
		if (song) {
			// play new song
			this.player.media.setSrc(song.streamURL);
			this.song = song;
		}

		this.player.play();
	}

	pause() {
		this.player.pause();
	}
}
