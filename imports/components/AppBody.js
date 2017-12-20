import React, { Component } from 'react';
import PropTypes from 'proptypes';
import { Container } from 'flux/utils';
import TabNav from './TabNav';
import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import TabUsers from './TabUsers';
import TabTopList from './TabTopList';
import SongContent from './SongContent';
// import PopUpLyric from './PopUpLyric';

class AppBody extends Component {
	static propTypes = {
	}

	static defaultProps = {
	}

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
				return (<SongContent />);
			case 1:
				return (<SongContent />);
			case 2:
				return (<SongContent />);
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
