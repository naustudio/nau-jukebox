/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import Navbar from './Navbar';

export default class AppHeader extends Component {
	state = { activeClasses: false };

	toggleClass() {
		const currentState = this.state.activeClasses;
		this.setState({ activeClasses: !currentState });
	}
	render() {
		return (
			<header className="header">
				<Navbar openNav={this.state.activeClasses} />
			</header>
		);
	}
}
