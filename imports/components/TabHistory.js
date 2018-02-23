/* © 2017
 * @author Tu Nguyen
 */

/* eslint-disable react/no-array-index-key */

import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'proptypes';
import { Songs } from '../collections';
import SongList from './SongList';

const queryLimit = 10;

class TabHistory extends Component {
	static propTypes = {
		songs: PropTypes.arrayOf(PropTypes.object),
		totalSongs: PropTypes.number,
		currentRoom: PropTypes.shape(),
	};

	static defaultProps = {
		songs: [],
		totalSongs: 0,
		currentRoom: {},
	};

	state = {
		songList: [],
		querySkip: queryLimit,
	};

	_loadMoreSong = () => {
		const querySongs = Songs.find(
			{
				author: Meteor.userId(),
				roomId: this.props.currentRoom ? this.props.currentRoom._id : null,
			},
			{
				skip: this.state.querySkip,
				limit: queryLimit,
				sort: { timeAdded: -1 },
			}
		).fetch();

		let songs = [];

		if (this.state.songList.length === 0) {
			songs = this.props.songs.slice();
		}

		this.setState({
			songList: songs.concat(querySongs),
			querySkip: this.state.querySkip + queryLimit,
		});
	};

	render() {
		const { totalSongs, songs } = this.props;
		const { songList } = this.state;

		return (
			<div>
				<SongList historyTab songs={songList.length > 0 ? songList : songs} />
				<div className="container">
					{totalSongs !== 0 && totalSongs !== songList.length ? (
						<div className="songs__list--center songs__list__control">
							<button onClick={this._loadMoreSong}>Load more</button>
						</div>
					) : (
						''
					)}
				</div>
			</div>
		);
	}
}

export default withTracker(({ currentRoom }) => ({
	songs: Songs.find(
		{
			author: Meteor.userId(),
			roomId: currentRoom ? currentRoom._id : null,
		},
		{
			limit: 10,
			sort: { timeAdded: -1 },
		}
	).fetch(),
	totalSongs: Songs.find({
		author: Meteor.userId(),
		roomId: currentRoom ? currentRoom._id : null,
	}).count(),
}))(TabHistory);
