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
	};

	static defaultProps = {
		songs: [],
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
		return <SongList songs={this.props.songs} />;
	}
}

export default withTracker(() => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return {
		songs: Songs.find({ timeAdded: { $gt: today.getTime() } }, { sort: { timeAdded: 1 } }).fetch(),
	};
})(Container.create(TabSongs));
