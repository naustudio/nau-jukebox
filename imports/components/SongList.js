/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { distanceInWordsStrict } from 'date-fns';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import { Users /* AppStates */ } from '../collections';
import * as AppActions from '../events/AppActions';

class SongList extends Component {
	static propTypes = {
		songs: PropTypes.arrayOf(PropTypes.object),
		onlineUsers: PropTypes.arrayOf(PropTypes.object),
	};

	static defaultProps = {
		songs: [],
		onlineUsers: [],
	};

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(/*prevState*/) {
		return {
			toggleBtnPlay: AppStore.getState()['toggleBtnPlay'],
			isSignIn: UserStore.getState()['isSignIn'],
			activeHost: UserStore.getState()['activeHost'],
			revealedSongs: AppStore.getState()['revealedSongs'],
			currentRoom: AppStore.getState()['currentRoom'],
		};
	}

	onOpenLyricPopup = e => {
		const id = e.currentTarget.dataset.id;
		if (id) {
			AppActions.updateLyricPopup(id);
			AppActions.openPopUp();
		}
	};

	getTime = date => `${distanceInWordsStrict(date, new Date())} ago`;

	getThumbnailClass = origin => {
		switch (origin) {
			case 'Soundcloud':
				return 'songs__list-item__thumbnail--sc';
			case 'NCT':
				return 'songs__list-item__thumbnail--nct';
			case 'Zing':
				return 'songs__list-item__thumbnail--zing';
			case 'YouTube':
				return 'songs__list-item__thumbnail--yt';
			default:
				return '';
		}
	};

	activeBtnPlay = () => {
		AppActions.activeBtnPlay();
	};

	rebookSong = e => {
		const userId = Meteor.userId();
		const songUrl = e.currentTarget.dataset.url;
		const { currentRoom } = this.state;

		if (!userId) {
			AppActions.errorSignIn();

			return;
		}

		if (songUrl && currentRoom) {
			Meteor.call('getSongInfo', songUrl, userId, currentRoom._id, (error /*, result*/) => {
				if (error) {
					alert(`Cannot add the song at:\n${songUrl}\nReason: ${error.reason}`);
				}
			});
		}
	};

	selectSong = e => {
		const id = e.currentTarget.dataset.id;
		if (id) {
			AppActions.selectSong(id);
		}
	};

	toggleUserBook = e => {
		const id = e.currentTarget.dataset.id;
		if (id) {
			AppActions.toggleUserBook(id);
		}
	};

	whoIsPlaying = id => {
		for (let i = 0; i < this.props.onlineUsers.length; i++) {
			if (id === this.props.onlineUsers[i].playing) {
				if (this.props.onlineUsers[i]._id === Meteor.userId()) {
					return <span className="playlist__item__active">&#9657;</span>;
				}

				return <span className="playlist__item__active">&#9656;</span>;
			}
		}

		return '';
	};

	fallbackImage = (imageUrl, id) => {
		if (imageUrl) {
			return imageUrl;
		}

		return `https://api.adorable.io/avatar/${id}`;
	};

	render() {
		const { revealedSongs = [], activeHost } = this.state;

		return (
			<section className="tab__body song">
				<div className="container song__container">
					<ul className="songs__list">
						{this.props.songs.map(song => (
							<li key={`${song._id}_${song.timeAdded}`} className="songs__list-item-wrapper playlist__item">
								{this.whoIsPlaying(song._id)}

								<div className="songs__list-item">
									<span className="songs__list-item__container">
										<span className="songs__list-item__thumbnail">
											<a
												href={`${song.originalURL}`}
												target="_blank"
												className={`songs__list-item__thumbnail--link ${this.getThumbnailClass(song.origin)}`}
											>
												<img src={`${this.fallbackImage(song.thumbURL, song._id)}`} alt={`${song.name}`} />
											</a>
										</span>
										<span className="songs__list-item__name">
											<a className="songs__list-item__name--link" data-id={song._id} onClick={this.selectSong}>
												{`${song.name}`} &nbsp; • &nbsp; {`${song.artist}`}
											</a>
										</span>
									</span>

									{revealedSongs.indexOf(song._id) > -1 ? (
										<span className="songs__list-item__author">{Users.findOne(song.author).profile.name}</span>
									) : null}

									<span className="songs__list-item__container">
										<span className="songs__list-item__control">
											<span className="songs__list-item__time">
												<small>{this.getTime(song.timeAdded)}</small>
											</span>
											{activeHost ? (
												<span
													className="songs__list-item__lyrics songs__list-item__icon"
													data-id={song._id}
													onClick={this.toggleUserBook}
												>
													<i className="fa fa-eye" />
												</span>
											) : null}
											<span
												className="songs__list-item__lyrics songs__list-item__icon"
												data-id={song._id}
												onClick={this.onOpenLyricPopup}
											>
												<i className="fa fa-file-text" />
											</span>
											<span
												className="songs__list-item__delete songs__list-item__icon"
												data-url={song.originalURL}
												onClick={this.rebookSong}
											>
												<i className="fa fa-retweet" />
											</span>
										</span>
									</span>
								</div>
							</li>
						))}
					</ul>
				</div>
			</section>
		);
	}
}

export default withTracker(() => {
	const onlineUsers = Users.find({
		'status.online': true,
		playing: { $ne: null },
	}).fetch();

	return {
		onlineUsers,
		userId: Meteor.userId(), // Must have this to keep tracker running, don't know why
	};
})(Container.create(SongList));

// export default Container.create(SongList);
