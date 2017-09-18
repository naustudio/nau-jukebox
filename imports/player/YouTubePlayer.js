/* © 2017 NauStud.io
 * @author Thanh Tran
 */
/*global MediaElementPlayer*/

/**
 * The YouTube player.
 *
 * This wraps the basic media element player with separate <video> tag
 */
export class YouTubePlayer {

	constructor(mainPlayer) {
		this.type = 'YouTubePlayer';
		this.song = null;
		this.mainPlayer = mainPlayer;
		this.videoEl = document.getElementById('youtube-player');
	}

	getYTVideoId(url) {
		var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		var match = url.match(regExp);
		if (match && match[2].length === 11) {
			return match[2];
		} else {
			// error
			return '';
		}
	}

	_onVideoEnded() {
		console.log('Video ended for:', this.song.name);
		this.mainPlayer.playNext();
	}

	play(song) {
		if (song) {
			this.song = song;

			if (this.player) {
				// youtube player already created, reuse by calling its api
				// let videoId = this.getYTVideoId(song.streamURL);
				// this.player.media.pluginApi.loadVideoById(videoId, 0);
				this.player.media.setSrc(song.streamURL);
			} else {
				// play new song
				this.videoEl.src = song.streamURL;
				this.player = new MediaElementPlayer(this.videoEl, {
					features: [
						// 'playpause',
						// 'progress',
						'current',
						'duration',
						// 'tracks',
						// 'volume',
						'fullscreen',
					],
					success: (mediaElement, originalNode, player) => {
						// console.log('youtubeplayer init success:', mediaElement, originalNode, player);
						// player.play();

						// this is simulated events, must add at success callback
						mediaElement.addEventListener('ended', () => {
							//avoid player flick during transition to next song
							// player.media.pluginApi.stopVideo();
							// a cue events will trigger later which we'll use to start next song
							this._onVideoEnded();
						});
					}
				});

				// for debugging
				// window.ytPlayer = this.player;
			}
		}

		this.player.play();
		this.videoEl.closest('.mejs__video').style.visibility = 'visible';
	}

	pause() {
		this.videoEl.closest('.mejs__video').style.visibility = 'hidden';
		this.player.pause();
	}

}
