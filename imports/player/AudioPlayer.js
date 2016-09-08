/*global MediaElementPlayer*/

/**
 * This wraps the basic media element player
 */
export class AudioPlayer {

	constructor(mainPlayer) {
		this.type = 'AudioPlayer';
		this.player = new MediaElementPlayer('#audio-player');
		this.song = null;


		$('#audio-player').on('ended', function() {
			console.log('Audio ended for:', mainPlayer.currentSong.name);
			mainPlayer.playNext();
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
