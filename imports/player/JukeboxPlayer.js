/*global AppStates, Songs*/
import { SongOrigin } from '../constants.js';
import { SCPlayer } from './SCPlayer.js';
import { AudioPlayer } from './AudioPlayer.js';

export class JukeboxPlayer {

	constructor() {

		this.activePlayer = null;
		this.playerAudio = new AudioPlayer(this);
		this.playerSoundcloud = new SCPlayer(this);

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
			} else {
				this.activePlayer = this.playerAudio;
			}
		}


		if (!stopped) {
			this.play();
		}
		document.title = 'NJ :: ' + song.name;
	}

	/**
	 * Play current or new song
	 * @return {[type]}        [description]
	 */
	play() {
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

		if (nextSong) {
			//delay some time so that calling play on the next song can work
			setTimeout(() => {
				this.selectSong(nextSong);
			}, 500);
		} else {
			console.log('No more song to play');
		}
	}

}


