import React, { Component } from 'react';
import { Container } from 'flux/utils';
import AppStore from '../events/AppStore';
import * as AppActions from '../events/AppActions';

class ButtonPlay extends Component {
	static getStores() {
		return [AppStore];
	}

	static calculateState(prevState) {
		return {
			activeBtnPlay: AppStore.getState()['activeBtnPlay'],
		};
	}

	toggleButton = () => {
		AppActions.toggleBtnPlay();
	}

	render() {
		return (
			<li className="navbar__item">
				<div
					className={`play-button play-button--play ${this.state.activeBtnPlay ? 'play-button--pause' : ''}`}
					onClick={this.toggleButton}
				>
					<div className="play-button__item play-button__top" />
					<div className="play-button__item play-button__right" />
					<div className="play-button__item play-button__bottom" />
					<div className="play-button__item play-button__left" />
				</div>
			</li>
		);
	}
}

export default Container.create(ButtonPlay);
