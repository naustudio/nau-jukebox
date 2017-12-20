import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import TabNav from './TabNav';
import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import TabUsers from './TabUsers';
import TabTopList from './TabTopList';
import TabSongs from './TabSongs';
import TabYesterday from './TabYesterday';
import TabLast7Days from './TabLast7Days';
// import PopUpLyric from './PopUpLyric';

class AppBody extends Component {
	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(prevState) {
		return {
			tabIndex: AppStore.getState()['tabIndex'],
		};
	}

	_renderTabItem = () => {
		const index = this.state.tabIndex;

		switch (index) {
			case 0:
				return <TabSongs />;
			case 1:
				return <TabYesterday />;
			case 2:
				return <TabLast7Days />;
			case 3:
				return (<TabTopList />);
			case 4:
				return (<TabUsers />);
			default:
				break;
		}

		return 0;
	}

	render() {
		return (
			<main className="tab">
				<TabNav />
				{/* <PopUpLyric /> */}
				<div className="app-body__container">
					{ this._renderTabItem() }
				</div>
			</main>
		);
	}
}

export default Container.create(AppBody);
