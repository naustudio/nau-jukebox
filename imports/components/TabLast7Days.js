/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'proptypes';
import { withTracker } from 'meteor/react-meteor-data';
import { distanceInWordsStrict, subDays } from 'date-fns';
import { Container } from 'flux/utils';
import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
// import SongStore from '../events/SongStore';
import * as AppActions from '../events/AppActions';

class TabSongs extends Component {
	static propTypes = {
		songs: PropTypes.arrayOf(),
	}

	static defaultProps = {
		songs: [],
	}

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(prevState) {
		return {
			// listSong: SongStore.getState()['listSong'],
			toggleBtnPlay: AppStore.getState()['toggleBtnPlay'],
			isSignIn: UserStore.getState()['isSignIn'],
			activeHost: UserStore.getState()['activeHost'],
		};
	}

	getTime = (date) => `${distanceInWordsStrict(date, new Date())} ago`;

	toggleUserBook = (e) => {
		const index = parseInt(e.currentTarget.dataset.index, 10);
		AppActions.toggleUserBook(index);
	}

	repeatSong = (e) => {
		if (this.state.isSignIn) {
			const index = parseInt(e.currentTarget.dataset.index, 10);
			AppActions.repeatSong(index);
		} else {
			AppActions.errorSignIn();
		}
	}

	activeBtnPlay = () => {
		AppActions.activeBtnPlay();
	}

	selectSong = (e) => {
		const index = e.currentTarget.dataset.index;
		this.setState({ selectSongIndex: index });
	}

	render() {
		return (
			<ul className="songs__list">
				{
					this.props.songs.map(song => (
						<li key={`${song.id}_${song.timeAdded}`} className="songs__list-item" >

							<span className="songs__list-item__container">
								<span className="songs__list-item__thumbnail">
									<img src={`${song.thumbURL}`} alt={`${song.name}`} />
								</span>
								<span className="songs__list-item__name">{`${song.name}`} &nbsp; • &nbsp; {`${song.artist}`} </span>
							</span>

							<span className="songs__list-item__container">
								<span className="songs__list-item__control">
									<span className="songs__list-item__time">
										<small>{this.getTime(song.timeAdded)}</small>
									</span>
									<span className="songs__list-item__lyrics songs__list-item__icon">
										<i className="fa fa-file-text" />
									</span>
									<span className="songs__list-item__delete  songs__list-item__icon">
										<i className="fa fa-times" />
									</span>
								</span>
							</span>
						</li>
					))
				}
			</ul>
		);
	}
}

export default withTracker(() => {
	const today = new Date();
	const sevenDaysAgo = subDays(today, 7);

	today.setHours(0, 0, 0, 0);
	sevenDaysAgo.setHours(0, 0, 0, 0);

	return {
		songs: Songs.find(
			{ timeAdded: { $gt: sevenDaysAgo.getTime(), $lt: today.getTime() } },
			{ sort: { timeAdded: 1 } }
		).fetch(),
	};
})(Container.create(TabSongs));

