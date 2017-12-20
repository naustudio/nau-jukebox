import React, { Component } from 'react';
import PropTypes from 'proptypes';
import { Container } from 'flux/utils';
import TabNav from './TabNav';
import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import TabSongs from './TabSongs';
import TabUsers from './TabUsers';
import TabTopSongs from './TabTopSongs';
// import PopUpLyric from './PopUpLyric';

class AppBody extends Component {
	static getStores() {
		return [AppStore, UserStore];
	}

	static propTypes = {
		tabIndex: PropTypes.number,
		toggleBtnNav: PropTypes.bool,
	}

	static defaultProps = {
		tabIndex: 0,
		toggleBtnNav: false,
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
			case 1:
			case 2:
				return (<TabSongs typeSong={index} />);
			case 3:
				return (<TabTopSongs />);
			case 4:
				return (<TabUsers />);
			default:
				return (<TabSongs />);
		}
	}

	render() {


		return (
			<main className="tab">
				<TabNav />
				{/* <PopUpLyric /> */}
				{ this._renderTabItem() }
			</main>
		);
	}
}

export default Container.create(AppBody);
