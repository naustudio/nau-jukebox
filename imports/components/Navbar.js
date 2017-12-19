/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import Host from './Host';
import SearchBox from './SearchBox';
import ButtonPlay from './ButtonPlay';

class NavBar extends Component {

	navbarBackground = () => {
		const rn = Math.floor(Math.random() * 150 + 60);
		const rs = Math.floor(Math.random() * 11 + 4);
		const t = new Trianglify({
			x_gradient: Trianglify.colorbrewer.Spectral[rs],
			noiseIntensity: 0,
			cellsize: rn,
		});

		const pattern = t.generate(window.innerWidth, 269);
		document.getElementById('js-navbar').setAttribute('style', `background-image: ${pattern.dataUrl}`);
	};

	render() {
		return (
			<nav className="navbar">
				<Host />
				<div className="container">
					<ul className={`navbar__list ${this.props.openNav} ? 'navbar__list--open' : ''`}>
						<li className="navbar__item navbar__item-logo">
							<a href="https://naustud.io" target="_blank">
								<img
									className="navbar__img"
									src="/nau-jukebox.svg"
									alt="logo"
								/>
							</a>
						</li>
						{/* /.navbar__item navbar__item-logo */}
						<SearchBox />
						{/* /.navbar__item navbar__item--input */}
						<ButtonPlay />
						{/* /.navbar__item navbar__item--play */}
					</ul>
					{/* /.navbar__list */}
				</div>
				{/* /.container */}
			</nav>
		);
	}
}

export default NavBar;
