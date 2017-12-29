/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import { Container } from 'flux/utils';
import { Link } from 'react-router-dom';
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
			toggleSearchInput: AppStore.getState()['toggleSearchInput'],
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

	calculateNavPadding = () => {
		if (this.state.toggleSearchInput) {
			$('.tab').addClass('tab--big');
			$('.navbar').addClass('navbar--big');
			$('.navbar__search-wrapper').addClass('navbar__search-wrapper--active');
		} else {
			$('.tab').removeClass('tab--big');
			$('.navbar').removeClass('navbar--big');
			$('.navbar__search-wrapper').removeClass('navbar__search-wrapper--active');
		}
	};

	render() {
		this.calculateNavPadding();

		return (
			<nav className="navbar" ref={this.refNav}>
				{/* <Host /> */}
				<h6 className="host nau--hidden-xxs nau--hidden-xs nau--hidden-sm">
					Room: {this.state.currentRoom ? this.state.currentRoom.name : ''} <br />
					<small>{window.location.href.split('#')[0]}</small>
				</h6>
				<div className="container navbar-container">
					<ul className="navbar__list noselect">
						<li className="navbar__item navbar__item-logo">
							<Link to="/">
								<img className="navbar__img" src="/nau-jukebox.svg" alt="logo" />
							</Link>
						</li>
						<li className="navbar__item nau--hidden-md nau--hidden-lg navbar__item__host-wrapper">
							<h6 className="navbar__item__host">Room: {this.state.currentRoom ? this.state.currentRoom.name : ''}</h6>
						</li>

						<li className="col col--7 navbar__item navbar__item--input nau--hidden-xxs nau--hidden-xs">
							<SearchBox />
						</li>

						<li className="navbar__item navbar__item__button-wrapper">
							<ButtonPlay />
						</li>
					</ul>

					<div className="nau--hidden-md nau--hidden-lg navbar__search-wrapper">
						<SearchBox />
					</div>
				</div>
			</nav>
		);
	}
}

export default Container.create(NavBar);
