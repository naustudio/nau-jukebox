/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import Host from './Host';
import SearchBox from './SearchBox';
import ButtonPlay from './ButtonPlay';

class NavBar extends Component {

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
