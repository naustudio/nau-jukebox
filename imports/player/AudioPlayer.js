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
			const zingTimeout = 5 * 60 * 60 * 1000;
			const nctTimeout = 23 * 60 * 60 * 1000;
			const songFetchTime = song.lastFetch || song.timeAdded;
			if (
				(song.origin === 'Zing' && songFetchTime + zingTimeout < Date.now()) ||
				(song.origin === 'NCT' && songFetchTime + nctTimeout < Date.now())
			) {
				Meteor.call('refetchSongInfo', song, (err, result) => {
					if (err) {
						console.log(err);
					}

					if (result) {
						this.player.media.setSrc(result);
						this.song = song;
						this.song.streamURL = result;
						this.player.play();
					}
				});
			} else {
				// play new song
				this.player.media.setSrc(song.streamURL);
				this.song = song;
				this.player.play();
			}
		}

		this.player.play();
	}

	pause() {
		this.player.pause();
	}
}
