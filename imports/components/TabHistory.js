/* © 2017
 * @author Tu Nguyen
 */

/* eslint-disable react/no-array-index-key */

import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'proptypes';
import { Songs } from '../collections';
import SongList from './SongList';

const queryLimit = 20;

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
		currentSongsAmount: this.props.songs.length,
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
		} else {
			songs = this.state.songList.slice();
		}

		songs = songs.concat(querySongs);

		this.setState({
			songList: songs,
			querySkip: this.state.querySkip + queryLimit,
			currentSongsAmount: songs.length,
		});
	};

	render() {
		const { totalSongs, songs } = this.props;
		const { songList, currentSongsAmount } = this.state;

		return (
			<div>
				<SongList historyTab songs={songList.length > 0 ? songList : songs} />
				<div className="container">
					{totalSongs !== 0 && totalSongs !== currentSongsAmount ? (
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
			limit: 20,
			sort: { timeAdded: -1 },
		}
	).fetch(),
	totalSongs: Songs.find({
		author: Meteor.userId(),
		roomId: currentRoom ? currentRoom._id : null,
	}).count(),
}))(TabHistory);
