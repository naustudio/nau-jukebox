/* © 2017
 * @author Tu Nguyen
 */

/* eslint-disable no-alert, react/no-danger */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { distanceInWordsStrict } from 'date-fns';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import he from 'he';
import ReactGA from 'react-ga';

import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import { Users /* AppStates */ } from '../collections';
import * as AppActions from '../events/AppActions';

class SongList extends Component {
	static propTypes = {
		songs: PropTypes.arrayOf(PropTypes.object),
		onlineUsers: PropTypes.arrayOf(PropTypes.object),
		userId: PropTypes.string,
		isPlayingList: PropTypes.bool,
		historyTab: PropTypes.bool,
	};

	static defaultProps = {
		songs: [],
		onlineUsers: [],
		userId: '',
		isPlayingList: false,
		historyTab: false,
	};

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(/*prevState*/) {
		return {
			isSignIn: UserStore.getState()['isSignIn'],
			currentRoom: AppStore.getState()['currentRoom'],
			selectedSong: AppStore.getState()['selectedSong'],
			activeBtnPlay: AppStore.getState()['activeBtnPlay'],
		};
	}

	componentDidMount() {
		if (this.interval) {
			clearInterval(this.interval);
		}
		this.interval = setInterval(() => {
			this.forceUpdate();
		}, 60000);
	}

	componentWillUnmount() {
		if (this.interval) {
			clearInterval(this.interval);
		}
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
		const songUrl = e.currentTarget.dataset.url;
		const { userId } = this.props;
		const { currentRoom } = this.state;

		if (!userId) {
			AppActions.errorSignIn();

			return;
		}

		if (songUrl && currentRoom) {
			ReactGA.event({
				category: 'Playlist',
				action: 'Booked an existing song',
			});
			Meteor.call('getSongInfo', songUrl, userId, currentRoom._id, (error /*, result*/) => {
				if (error) {
					AppActions.setToaster(true, `Cannot add the song at:\n${songUrl}\nReason: ${error.reason}`, 'error');
				} else {
					AppActions.setToaster(true, `Song's added successfully`, 'success');
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

	removeSong = e => {
		const id = e.currentTarget.dataset.id;
		const roomId = this.state.currentRoom._id;
		if (id && roomId) {
			const rs = window.confirm('Are you sure');
			if (rs) {
				Meteor.call('removeSong', id, roomId, err => {
					if (err) {
						console.log(err);
					}
				});
			}
		}
	};

	toggleUserBook = e => {
		const id = e.currentTarget.dataset.id;
		const revealed = e.currentTarget.dataset.revealed === 'true';

		if (id) {
			Meteor.call('toggleSongAuthor', id, !revealed, err => {
				if (err) {
					console.log(err);
				}
			});
		}
	};

	whoIsPlaying = id => {
		const { currentRoom, selectedSong, activeBtnPlay } = this.state;
		if (activeBtnPlay && selectedSong && id === selectedSong._id) {
			return (
				<span
					className={`${
						Meteor.userId() === currentRoom.hostId
							? 'playlist__item__active playlist__item__active-host'
							: 'playlist__item__active'
					}`}
				>
					&#9656;
				</span>
			);
		}
		for (let i = 0; i < this.props.onlineUsers.length; i++) {
			if (id === this.props.onlineUsers[i].playing) {
				return (
					<span
						className={`${
							this.props.onlineUsers[i]._id === currentRoom.hostId
								? 'playlist__item__active playlist__item__active-host'
								: 'playlist__item__active'
						}`}
					>
						&#9657;
					</span>
				);
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
		const { currentRoom } = this.state;
		const { userId, historyTab } = this.props;
		const songs = this.props.songs;
		const emptyMessage = this.props.isPlayingList
			? 'Please book your first song of the day.'
			: 'No songs available. ¯\\_(ツ)_/¯';

		// prettier-ignore
		return (
			<section className="tab__body song">
				<div className="container song__container">
					<ul className="songs__list">
						{songs && songs.length ?
						songs.map(song => (
							<li key={`${song._id}_${song.timeAdded}`} className="songs__list-item-wrapper">
								<div className={`songs__list-item ${this.state.selectedSong && this.state.selectedSong._id === song._id ? 'songs__list-item--playing' : ''}`}>

									<span className="songs__list-item__container songs__list-item__left">

										<div className="songs__list__player-info">
											{!historyTab && song.isRevealed ? (
												<span className="songs__list-item__author nau--hidden-xxs nau--hidden-xs nau--hidden-sm">{Users.findOne(song.author).profile.name}</span>
											) : null}
											<div className="songs__list-item__playing-wrapper">
												{this.whoIsPlaying(song._id)}
											</div>
										</div>

										<span className="songs__list-item__thumbnail">
											<a
												href={`${song.originalURL}`}
												target="_blank"
												className={`songs__list-item__thumbnail--link ${this.getThumbnailClass(song.origin)}`}
												title={`Open original URL at ${song.origin}`}
												style={{
													background: `url(${this.fallbackImage(song.thumbURL, song._id)}) no-repeat center center`,
													backgroundSize: '75px',
												}}
											/>
										</span>
										<span className="songs__list-item__name">
											<a
												className="songs__list-item__name--link"
												data-id={song._id}
												onClick={this.selectSong}
												title={`${he.decode(song.name)} • ${song.artist}`}
											>
												{he.decode(song.name)} • {song.artist}
											</a>
										</span>
									</span>

									<span className="songs__list-item__container songs__list-item__right">
										{song.isRevealed ? (
											<span className="songs__list-item__author--mobile nau--hidden-md nau--hidden-lg">{Users.findOne(song.author).profile.name}</span>
										) : null}

										<span className="songs__list-item__control">
											<span className="songs__list-item__time">
												<small>{this.getTime(song.timeAdded)}</small>
											</span>
											{!historyTab && currentRoom && currentRoom.hostId === userId ? (
												<span
													className="songs__list-item__lyrics songs__list-item__icon"
													data-id={song._id}
													data-revealed={song.isRevealed}
													onClick={this.toggleUserBook}
													title="Reveal who booked this song"
												>
													<i className="fa fa-eye" />
												</span>
											) : null}
											<span
												className={`songs__list-item__lyrics songs__list-item__icon ${
													!song.lyric ? 'songs__list-item__icon--disable' : ''
												}`}
												data-id={song._id}
												onClick={song.lyric ? this.onOpenLyricPopup : null}
												title="View lyrics"
											>
												<i className="fa fa-file-text" />
											</span>
											<span
												className="songs__list-item__delete songs__list-item__icon"
												data-url={song.originalURL}
												onClick={this.rebookSong}
												title="Re-book this song"
											>
												<i className="fa fa-retweet" />
											</span>
											{!historyTab && currentRoom && currentRoom.hostId === userId ? (
												<span
													className="songs__list-item__delete songs__list-item__icon"
													data-id={song._id}
													onClick={this.removeSong}
													title="Remove this song"
												>
													<i className="fa fa-close" />
												</span>
											) : null}
										</span>
									</span>
								</div>

							</li>
						))
						:
						emptyMessage
						}
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
