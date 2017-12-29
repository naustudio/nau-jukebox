import React, { Component } from 'react';
import { Container } from 'flux/utils';
import AppStore from '../events/AppStore';
import * as AppActions from '../events/AppActions';

class ButtonPlay extends Component {
	static getStores() {
		return [AppStore];
	}

	static calculateState(/*prevState*/) {
		return {
			activeBtnPlay: AppStore.getState()['activeBtnPlay'],
			selectedSong: AppStore.getState()['selectedSong'],
		};
	}

	toggleButton = () => {
		if (!this.state.selectedSong) {
			return;
		}

		if (this.state.activeBtnPlay) {
			AppActions.deactiveBtnPlay();
		} else {
			AppActions.activeBtnPlay();
		}
	};

	render() {
		// <div className="play-button__item play-button__top" />
		// <div className="play-button__item play-button__top" />
		// <div className="play-button__item play-button__right" />
		// <div className="play-button__item play-button__bottom" />
		// <div className="play-button__item play-button__left" />

		console.log('state button', this.state.activeBtnPlay);

		return (
			<button
				className={`play-button ${this.state.activeBtnPlay ? 'play-button--paused' : ''}`}
				onClick={this.toggleButton}
			/>
		);
	}
}

export default Container.create(ButtonPlay);
