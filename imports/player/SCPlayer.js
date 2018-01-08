/* © 2017 NauStud.io
 * @author Tung Tran
 */
/*global SC*/

/**
 * SoundClound Player
 */
export default class SCPlayer {

	constructor(mainPlayer) {
		this.type = 'SoundCloudPlayer';
		this.mainPlayer = mainPlayer;
		this.playerSoundcloudDictionary = {}; //
		this.player = null; //
		this.song = null; //current song object

		SC.initialize({
			client_id: 'f6dbfb46c6b75cb6b5cd84aeb50d79e3'
		});
	}

	/**
	 * Play a song from Sound Cloud
	 * @param  {[type]} song [description]
	 * @return {[type]}      [description]
	 */
	play(song) {
		if (song) {
			this.song = song;
			// play new
			if (this.player) {
				this.player.pause();
			}
			if (this.playerSoundcloudDictionary[song.streamURL]) {
				// get existing SC player
				this.player = this.playerSoundcloudDictionary[song.streamURL];
				this.player.seek(0);
				this.player.play();
				// playWithEffect(); --> moved
			} else {
				// create new SC player
				SC.stream(song.streamURL).then((scPlayer) => {
					if (scPlayer.options.protocols[0] === 'rtmp') {
						scPlayer.options.protocols.splice(0, 1);
					}
					scPlayer.on('finish', () => {
						this.mainPlayer.playNext();
					});
					this.playerSoundcloudDictionary[song.streamURL] = scPlayer;
					// change player
					this.player = scPlayer;
					// start play
					this.player.play();
				});
			}
		} else if (this.player && this.song) {
			this.player.play();
		}
	}

	pause() {
		if (this.player) {
			this.player.pause();
		}
	}

}
