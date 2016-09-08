/*global AppStates, Songs*/
import { SongOrigin } from '../constants.js';
import { SCPlayer } from './SCPlayer.js';
import { AudioPlayer } from './AudioPlayer.js';
import { YouTubePlayer } from './YouTubePlayer.js';

/**
 * The main JukeboxPlayer which act as wrapper for different type of player inside
 *
 * Currently in the wrapper: AudioPlayer, SoundCloudPlayer, YouTubePlayer
 */
export class JukeboxPlayer {

	constructor() {

		this.activePlayer = null;
		this.playerAudio = new AudioPlayer(this);
		this.playerSoundcloud = new SCPlayer(this);
		this.playerYouTube = new YouTubePlayer(this);

		this.currentSong = null;
		this.prevSong = null;
		this.playing = false;
		this._isNew = false;
	}

	/**
	 * Keep the media player have a selected song ready to play
	 * @param  {Object} song [description]
	 * @param  {Boolean} stopped whether select the song without playing
	 * @return {[type]}      [description]
	 */
	selectSong(song, stopped) {
		if (!this.currentSong || song._id !== this.currentSong._id) {
			this.prevSong = this.currentSong;
			this.currentSong = song;
			this._isNew = true;

			Session.set('selectedSong', song._id);

			this.pause();

			// switch active player base on its original
			if (this.currentSong.origin === SongOrigin.SOUNDCLOUD) {
				this.activePlayer = this.playerSoundcloud;
			} else if (this.currentSong.origin === SongOrigin.YOUTUBE) {
				this.activePlayer = this.playerYouTube;
			} else {
				this.activePlayer = this.playerAudio;
			}
		}
		console.log('selectSong', song.name, song.origin, this.activePlayer.type);

		if (!stopped) {
			if (this.activePlayer.type === 'AudioPlayer') {
				// delay for MediaElementPlayer has a bug if we pause and play next song immediately
				setTimeout(() => {
					this.play();
				}, 700);
			} else {
				this.play();
			}
		}
		document.title = 'NJ :: ' + song.origin + ' : ' + song.name;
	}

	/**
	 * Play current or new song
	 * @return {[type]}        [description]
	 */
	play() {
		if (!this.currentSong) {
			return;
		}
		AppStates.updatePlayingSongs(this.currentSong._id, this.prevSong ? this.prevSong._id : '');

		var $playButton = $('.js-play-button');
		$playButton.removeClass('_play').addClass('_pause');

		if (this._isNew) {
			this._isNew = false;
			this.activePlayer.play(this.currentSong);
		} else {
			this.activePlayer.play();
		}
		this.playing = true;
	}

	/**
	 * Pause current song
	 * @return {[type]} [description]
	 */
	pause() {
		AppStates.updatePlayingSongs('', this.currentSong._id);

		var $playButton = $('.js-play-button');
		$playButton.removeClass('_pause').addClass('_play');

		if (this.activePlayer) {
			this.activePlayer.pause();
		}
		this.playing = false;
	}

	/**
	 * Play next song
	 * @return {[type]} [description]
	 */
	playNext() {
		var nextSong = Songs.findOne({timeAdded: {$gt: this.currentSong.timeAdded}});
		// console.log('Play next:', nextSong.name, nextSong.origin);

		if (nextSong) {
			//delay some time so that calling play on the next song can work
			this.selectSong(nextSong);
		} else {
			console.log('No more song to play');
		}
	}

}


