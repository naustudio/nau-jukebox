/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'proptypes';
import { withTracker } from 'meteor/react-meteor-data';
import { subDays } from 'date-fns';
import { Songs } from '../collections';
import SongList from './SongList';

class TabLast7Days extends Component {
	static propTypes = {
		songs: PropTypes.arrayOf(PropTypes.object),
	};

	static defaultProps = {
		songs: [],
	};

	render() {
		return <SongList songs={this.props.songs} />;
	}
}

export default withTracker(({ currentRoom }) => {
	const today = new Date();
	const sevenDaysAgo = subDays(today, 7);

	today.setHours(0, 0, 0, 0);
	sevenDaysAgo.setHours(0, 0, 0, 0);

	return {
		songs: Songs.find(
			{
				timeAdded: { $gt: sevenDaysAgo.getTime(), $lt: today.getTime() },
				roomId: currentRoom ? currentRoom._id : null,
			},
			{ sort: { timeAdded: 1 } }
		).fetch(),
	};
})(TabLast7Days);
