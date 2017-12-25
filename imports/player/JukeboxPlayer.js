/* © 2017 NauStud.io
 * @author Thanh Tran
 */
import { Songs /* Users */ } from '../collections';
import { SongOrigin } from '../constants';
import SCPlayer from './SCPlayer';
import AudioPlayer from './AudioPlayer';
import YouTubePlayer from './YouTubePlayer';
import { deactiveBtnPlay, selectSong } from '../events/AppActions';

/**
 * The main JukeboxPlayer which act as wrapper for different type of player inside
 *
 * Currently in the wrapper: AudioPlayer, SoundCloudPlayer, YouTubePlayer
 */
export default class JukeboxPlayer {
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

		if (!stopped) {
			if (this.activePlayer.type === 'AudioPlayer') {
				// delay for MediaElementPlayer has a bug if we pause and play next song immediately
				console.log('Next player is AudioPlayer, delaying...');
				setTimeout(() => {
					console.log('AudioPlayer play now!');
					this.play();
				}, 500);
			} else {
				this.play();
			}
		}
		document.title = `NJ :: ${song.origin} : ${song.name}`;
	}

	/**
	 * Play current or new song
	 * @return {[type]}        [description]
	 */
	play() {
		if (!this.currentSong) {
			return;
		}

		if (Meteor.userId()) {
			// Users.update(Meteor.userId(), { playing: this.currentSong._id });
			Meteor.call('updatePlayingStatus', Meteor.userId, this.currentSong._id);
		}

		// AppStates.updatePlayingSongs(this.currentSong._id, this.prevSong ? this.prevSong._id : '');
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
		if (Meteor.userId()) {
			Meteor.call('removePlayingStatus', Meteor.userId);
		}

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
		const nextSong = Songs.findOne({ timeAdded: { $gt: this.currentSong.timeAdded }, roomId: this.currentSong.roomId });

		if (nextSong) {
			//delay some time so that calling play on the next song can work
			selectSong(nextSong._id);
		} else {
			console.log('No more song to play');
			deactiveBtnPlay();
		}
	}
}
