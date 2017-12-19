/* © 2017 NauStud.io
 * @author Thanh Tran
 */
/*global MediaElementPlayer*/

/**
 * This wraps the basic media element player
 */
export default class AudioPlayer {

	constructor(mainPlayer) {
		this.type = 'AudioPlayer';
		this.player = new MediaElementPlayer('audio-player');
		this.song = null;


		this.player.media.addEventListener('ended', () => {
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
