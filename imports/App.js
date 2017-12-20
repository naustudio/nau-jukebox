/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import { Container } from 'flux/utils';

import AppHeader from './components/AppHeader';
import AppBody from './components/AppBody';
import AppStore from './events/AppStore';
import UserStore from './events/UserStore';
import JukeboxPlayer from './player/JukeboxPlayer';

class App extends Component {
	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(prevState) {
		return {
			selectedSong: AppStore.getState()['selectedSong'],
			activeBtnPlay: AppStore.getState()['activeBtnPlay']
		};
	}

	componentDidMount() {
		this.player = new JukeboxPlayer();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.selectedSong !== this.state.selectedSong && this.state.selectedSong) {
			this.player.selectSong(this.state.selectedSong);
		}

		if (prevState.activeBtnPlay !== this.state.activeBtnPlay) {
			if (this.state.activeBtnPlay) {
				this.player.play();
			} else {
				this.player.pause();
			}
		}
	}

	player;

	render() {
		return (
			<div>
				<AppHeader />
				<AppBody />
				<div className="player-panel">
					<audio id="audio-player" src="song.mp3" preload="none" width="300" />
					<video id="youtube-player" preload="none" width="300" height="200" src="" />
				</div>
			</div>
		);
	}
}

export default Container.create(App);
