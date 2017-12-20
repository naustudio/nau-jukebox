/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import { Container } from 'flux/utils';
import AppStore from '../events/AppStore';
import TabSongs from './TabSongs';
import TabYesterday from './TabYesterday';
import TabLast7Days from './TabLast7Days';

class SongContent extends Component {

	static propTypes = {
	}

	static defaultProps = {
	}

	static getStores() {
		return [AppStore];
	}

	static calculateState(prevState) {
		return {
			tabIndex: AppStore.getState()['tabIndex'],
		};
	}

	renderTab = () => {
		const index = this.state.tabIndex;

		switch (index) {
			case 0:
				return <TabSongs />;
			case 1:
				return <TabYesterday />;
			case 2:
				return <TabLast7Days />;
			default:
				break;
		}
	}
	render() {
		return (
			<section className="tab__body song">
				<div className="container song__container">
					{ this.renderTab() }
				</div>
			</section>
		);
	}
}

export default Container.create(SongContent);
