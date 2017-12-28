/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import { Container } from 'flux/utils';
// import Host from './Host';

import SearchBox from './SearchBox';
import ButtonPlay from './ButtonPlay';
import AppStore from '../events/AppStore';

class NavBar extends Component {
	static getStores() {
		return [AppStore];
	}

	static calculateState(/*prevState*/) {
		return {
			currentRoom: AppStore.getState()['currentRoom'],
		};
	}

	componentDidMount() {
		this.navbarBackground();
		Meteor.setInterval(this.navbarBackground, 60000);
	}

	navbarBackground = () => {
		const rn = Math.floor(Math.random() * 150 + 60);
		const rs = Math.floor(Math.random() * 11 + 4);
		const t = new Trianglify({
			x_gradient: Trianglify.colorbrewer.Spectral[rs],
			noiseIntensity: 0,
			cellsize: rn,
		});

		const pattern = t.generate(window.innerWidth, 269);
		if (this.navBar) {
			this.navBar.setAttribute('style', `background-image: ${pattern.dataUrl}`);
		}
	};

	refNav = ref => {
		this.navBar = ref;
	};

	render() {
		return (
			<nav className="navbar" ref={this.refNav}>
				{/* <Host /> */}
				<h6 className="host">
					Room: {this.state.currentRoom ? this.state.currentRoom.name : ''} <br />
					<small>{window.location.href.split('#')[0]}</small>
				</h6>
				<div className="container navbar-container">
					<ul className="navbar__list noselect">
						<li className="navbar__item navbar__item-logo">
							<a href="https://naustud.io" target="_blank" rel="noopener noreferrer">
								<img className="navbar__img" src="/nau-jukebox.svg" alt="logo" />
							</a>
						</li>
						<SearchBox />
						<ButtonPlay />
					</ul>
				</div>
			</nav>
		);
	}
}

export default Container.create(NavBar);
