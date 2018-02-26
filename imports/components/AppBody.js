/* © 2017 NauStud.io
 * @author Tú
 */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { withTracker } from 'meteor/react-meteor-data';
import { UserStatus } from 'meteor/mizzao:user-status';

import TabNav from './TabNav';
import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import TabUsers from './TabUsers';
import TabTopList from './TabTopList';
import TabSongs from './TabSongs';
import TabYesterday from './TabYesterday';
import TabHistory from './TabHistory';
import TabLast7Days from './TabLast7Days';
import PopUpLyric from './PopUpLyric';
import ChatBox from './ChatBox';

class AppBody extends Component {
	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(/*prevState*/) {
		return {
			tabIndex: AppStore.getState()['tabIndex'],
			currentRoom: AppStore.getState()['currentRoom'],
		};
	}

	_renderTabItem = () => {
		const index = this.state.tabIndex;
		const { currentRoom } = this.state;

		switch (index) {
			case 0:
				return <TabSongs currentRoom={currentRoom} />;
			case 1:
				return <TabYesterday currentRoom={currentRoom} />;
			case 2:
				return <TabLast7Days currentRoom={currentRoom} />;
			case 3:
				return <TabTopList currentRoom={currentRoom} />;
			case 4:
				return <TabUsers currentRoom={currentRoom} />;
			case 5:
				return <TabHistory currentRoom={currentRoom} />;
			default:
				break;
		}

		return 0;
	};

	render() {
		return (
			<main className="tab">
				<TabNav />
				<PopUpLyric />
				<div className="app-body__container">{this._renderTabItem()}</div>
				<ChatBox />
			</main>
		);
	}
}

export default withTracker(() => {
	if (Meteor.userId()) {
		try {
			UserStatus.startMonitor({
				threshold: 30000,
				interval: 2000,
				idleOnBlur: true,
			});
		} catch (err) {
			console.log('Syncing...');
		}
	}

	return {};
})(Container.create(AppBody));
