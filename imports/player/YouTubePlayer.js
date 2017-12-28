/* © 2017 NauStud.io
 * @author Thanh Tran
 */
/*global MediaElementPlayer*/

/**
 * The YouTube player.
 *
 * This wraps the basic media element player with separate <video> tag
 */
export default class YouTubePlayer {
	constructor(mainPlayer) {
		this.type = 'YouTubePlayer';
		this.song = null;
		this.mainPlayer = mainPlayer;
		this.videoEl = document.getElementById('youtube-player');
		this.panelPlayer = document.querySelector('.player-panel');
	}

	getYTVideoId(url) {
		const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		if (match && match[2].length === 11) {
			return match[2];
		}

		return '';
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
						'current',
						'progress',
						'duration',
						// 'tracks',
						// 'volume',
						'fullscreen',
					],
					success: (mediaElement /*, originalNode, player*/) => {
						// console.log('youtubeplayer init success:', mediaElement, originalNode, player);
						// store the container to show / hide
						this.container = mediaElement.closest('.mejs__video');
						if (!this.container) {
							// just in case closest() not working
							this.container = document.querySelector('.mejs__video');
						}

						// this is simulated events, must add at success callback
						mediaElement.addEventListener('ended', () => {
							//avoid player flick during transition to next song
							// player.media.pluginApi.stopVideo();
							// a cue events will trigger later which we'll use to start next song
							this._onVideoEnded();
						});
					},
				});

				// for debugging
				// window.ytPlayer = this.player;
			}
		}

		this.player.play();
		if (this.container) {
			this.panelPlayer.style.zIndex = 1;
			this.container.style.display = 'block';
		}
	}

	pause() {
		if (this.container) {
			this.panelPlayer.style.zIndex = -1;
			this.container.style.display = 'none';
		}
		this.player.pause();
	}
}
