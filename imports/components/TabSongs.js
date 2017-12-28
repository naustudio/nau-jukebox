/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'proptypes';
import { Container } from 'flux/utils';
import { withTracker } from 'meteor/react-meteor-data';
import { Songs } from '../collections';
import AppStore from '../events/AppStore';
import SongList from './SongList';

class TabSongs extends Component {
	static propTypes = {
		songs: PropTypes.arrayOf(PropTypes.object),
		isLoadingSong: PropTypes.bool,
	};

	static defaultProps = {
		songs: [],
		isLoadingSong: false,
	};

	static getStores() {
		return [AppStore];
	}

	static calculateState(/*prevState*/) {
		return {
			activeBtnPlay: AppStore.getState()['activeBtnPlay'],
		};
	}

	render() {
		if (this.props.isLoadingSong) {
			return (
				<section className="tab__body song">
					<div className="container song__container">Fetching songs...</div>
				</section>
			);
		}

		return <SongList songs={this.props.songs} isPlayingList />;
	}
}

export default withTracker(({ currentRoom }) => {
	const today = new Date();
	const songHandle = Meteor.subscribe('Songs.public');
	today.setHours(0, 0, 0, 0);

	return {
		isLoadingSong: !songHandle.ready(),
		songs: Songs.find(
			{
				timeAdded: { $gt: today.getTime() },
				roomId: currentRoom ? currentRoom._id : null,
			},
			{
				sort: { timeAdded: 1 },
			}
		).fetch(),
	};
})(Container.create(TabSongs));
