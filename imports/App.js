/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { withTracker } from 'meteor/react-meteor-data';

import { Rooms } from './collections';
import AppHeader from './components/AppHeader';
import AppBody from './components/AppBody';
import { setRoom, activeHost, setToaster } from './events/AppActions';
import AppStore from './events/AppStore';
import UserStore from './events/UserStore';
import JukeboxPlayer from './player/JukeboxPlayer';
import Toaster from './components/Toaster';

class App extends Component {
	static propTypes = {
		room: PropTypes.shape({}),
		currentUserId: PropTypes.string,
		history: PropTypes.shape({
			replace: PropTypes.func,
		}).isRequired,
	};

	static defaultProps = {
		room: null,
		currentUserId: '',
	};

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(/*prevState*/) {
		return {
			selectedSong: AppStore.getState()['selectedSong'],
			activeBtnPlay: AppStore.getState()['activeBtnPlay'],
			toasterOpen: AppStore.getState()['toasterOpen'],
			toasterText: AppStore.getState()['toasterText'],
			toasterType: AppStore.getState()['toasterType'],
		};
	}

	componentDidMount() {
		this.player = new JukeboxPlayer();
	}

	componentWillReceiveProps(nextProps) {
		const { room, currentUserId } = nextProps;

		if (!room) {
			this.props.history.replace('/');
		} else {
			setRoom(room);
			if (currentUserId) {
				if (currentUserId === room.hostId) {
					activeHost(true);
				}
				Meteor.call('updateUserRoom', currentUserId, room._id, err => {
					if (err) {
						console.log(err);
					}
				});
			}
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.selectedSong !== this.state.selectedSong && this.state.selectedSong) {
			this.player.selectSong(this.state.selectedSong);
		}

		if (prevState.activeBtnPlay !== this.state.activeBtnPlay) {
			if (this.state.activeBtnPlay) {
				this.player.play();
			} else {
				this.player.pause();
			}
		}
	}

	onToasterClose = () => {
		setToaster(false);
	};

	player;

	render() {
		const { toasterOpen, toasterText, toasterType } = this.state;

		return (
			<div>
				<AppHeader />
				<AppBody room={this.props.room} />
				<div className="player-panel" style={{ zIndex: -1 }}>
					<audio id="audio-player" src="song.mp3" preload="none" width="300" />
					<video id="youtube-player" preload="none" width="300" height="200" src="" />
				</div>
				<Toaster text={toasterText} open={toasterOpen} type={toasterType} onClose={this.onToasterClose} />
			</div>
		);
	}
}

export default withTracker(({ match }) => {
	const slug = match.params.slug || '';
	const roomHandle = Meteor.subscribe('Rooms.public');

	return {
		isLoadingSong: !roomHandle.ready(),
		currentUserId: Meteor.userId(),
		room: Rooms.findOne({ slug }),
	};
})(Container.create(App));
