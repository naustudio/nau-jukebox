/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { distanceInWordsStrict } from 'date-fns';
import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import * as AppActions from '../events/AppActions';

class SongList extends Component {
	static propTypes = {
		songs: PropTypes.arrayOf(PropTypes.object)
	};

	static defaultProps = {
		songs: []
	};

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(prevState) {
		return {
			// listSong: SongStore.getState()['listSong'],
			toggleBtnPlay: AppStore.getState()['toggleBtnPlay'],
			isSignIn: UserStore.getState()['isSignIn'],
			activeHost: UserStore.getState()['activeHost']
		};
	}

	getTime = date => `${distanceInWordsStrict(date, new Date())} ago`;

	repeatSong = e => {
		if (this.state.isSignIn) {
			const index = parseInt(e.currentTarget.dataset.index, 10);
			AppActions.repeatSong(index);
		} else {
			AppActions.errorSignIn();
		}
	};

	activeBtnPlay = () => {
		AppActions.activeBtnPlay();
	};

	selectSong = e => {
		const index = e.currentTarget.dataset.index;
		this.setState({ selectSongIndex: index });
	};

	toggleUserBook = e => {
		const index = parseInt(e.currentTarget.dataset.index, 10);
		AppActions.toggleUserBook(index);
	};

	render() {
		return (
			<section className="tab__body song">
				<div className="container song__container">
					<ul className="songs__list">
						{this.props.songs.map(song => (
							<li key={`${song.id}_${song.timeAdded}`} className="songs__list-item">
								<span className="songs__list-item__container">
									<span className="songs__list-item__thumbnail">
										<a href={`${song.originalURL}`} target="_blank" className="songs__list-item__thumbnail--link">
											<img src={`${song.thumbURL}`} alt={`${song.name}`} />
										</a>
									</span>
									<span className="songs__list-item__name">
										<a href="#" className="songs__list-item__name--link">
											{`${song.name}`} &nbsp; • &nbsp; {`${song.artist}`}
										</a>
									</span>
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
											<i className="fa fa-retweet" />
										</span>
									</span>
								</span>
							</li>
						))}
					</ul>
				</div>
			</section>
		);
	}
}

export default Container.create(SongList);
