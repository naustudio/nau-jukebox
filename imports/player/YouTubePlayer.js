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
		this.$player = $('#youtube-player');
	}

	getYTVideoId(url) {
		var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
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
		this.player.media.pluginApi.stopVideo();
		this.mainPlayer.playNext();
	}

	play(song) {
		if (song) {
			this.song = song;

			if (this.player) {
				// youtube player already created, reuse by calling its api
				let videoId = this.getYTVideoId(song.streamURL);
				this.player.media.pluginApi.loadVideoById(videoId, 0);
			} else {

				// play new song
				this.$player.find('source').attr('src', song.streamURL);
				this.player = new MediaElementPlayer(this.$player, {
					features: [
						// 'playpause',
						// 'progress',
						'current',
						'duration',
						// 'tracks',
						// 'volume',
						'fullscreen',
					],
					success: (media) => {
						this.player.play();

						// this is fake events, must add at success callback
						media.addEventListener('ended', () => {
							//avoid player flick during transition to next song
							media.pause();
							this._onVideoEnded();
						});
					}
				});

				// for debugging
				// window.mePlayer = this.player;
			}
		} else {
			this.player.play();
		}

		this.$player.closest('.mejs-video').css('visibility', 'visible');

	}

	pause() {
		this.$player.closest('.mejs-video').css('visibility', 'hidden');
		this.player.pause();
	}

}
