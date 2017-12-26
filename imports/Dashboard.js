/* © 2017
 * @author Eric
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { withTracker } from 'meteor/react-meteor-data';

import blockWords from './helpers/block-words.json';
import { errorSignInDashboard } from './events/AppActions';
import { Rooms } from './collections';
import AccountsUIWrapper from './components/AccountUIWrapper';
import AppStore from './events/AppStore';
import UserStore from './events/UserStore';

class Dashboard extends Component {
	static propTypes = {
		isSignedIn: PropTypes.bool,
		history: PropTypes.shape({
			push: PropTypes.func,
		}),
		rooms: PropTypes.arrayOf(PropTypes.object),
	};

	static defaultProps = {
		isSignedIn: false,
		history: null,
		rooms: [],
	};

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(/*prevState*/) {
		return {
			errorSignIn: UserStore.getState()['errorSignInDashboard'],
		};
	}

	onInputName = e => {
		const input = e.target;
		const blockCharacter = /[!@#$%^&*()+=_{}[\]|\\/:;"'><?~`,.]/g;
		let usingBlockWordFlag = false;

		if (blockCharacter.test(input.value)) {
			input.setCustomValidity("Use only alphanumeric characters, space or '-'");

			return;
		}

		blockWords.forEach(word => {
			if (input.value.indexOf(word) > -1) {
				usingBlockWordFlag = true;
			}
		});

		if (usingBlockWordFlag) {
			input.setCustomValidity('You are using block words. Please try a different name');
		} else {
			input.setCustomValidity('');
		}
	};

	onCreateRoom = e => {
		e.preventDefault();
		if (!this.props.isSignedIn) {
			errorSignInDashboard();

			return;
		}

		const form = e.currentTarget;
		if (form.name && form.name.value) {
			Meteor.call('createRoom', form.name.value, Meteor.userId(), (err, id) => {
				if (err) {
					alert(err);
				} else {
					this.props.history.push(`/rooms/${Rooms.findOne(id).slug}`);
				}
			});
		}
	};

	render() {
		const { rooms, isSignedIn } = this.props;
		const { errorSignIn } = this.state;

		return (
			<div className="dashboard">
				<img src="/nau-jukebox.svg" alt="nau jukebox logo" className="dashboard__logo" />
				<div className="dashboard__content">
					<div className="dashboard__login-block">
						<AccountsUIWrapper />
						{errorSignIn && !isSignedIn ? (
							<div className="dashboard__login-block__error">
								<p>Please login first!</p>
							</div>
						) : null}
					</div>
					{rooms && rooms.length ? (
						<div className="dashboard__room-container">
							<h5 className="dashboard__room-header">Rooms of which I am the host</h5>
							<ul className="dashboard__room-list">
								{rooms.map(room => (
									<li className="dashboard__room" key={room._id}>
										<span className="dashboard__room-name">{room.name}</span>
										<a href={`/rooms/${room.slug}`} className="dashboard__join-button button">
											JOIN
										</a>
									</li>
								))}
							</ul>
						</div>
					) : null}
					<form className="dashboard__add-room" onSubmit={this.onCreateRoom}>
						<input type="text" placeholder="Room name" required name="name" minLength="4" onInput={this.onInputName} />
						<button type="submit" className="dashboard__create-button">
							CREATE
						</button>
					</form>
				</div>
			</div>
		);
	}
}

export default withTracker(() => ({
	isSignedIn: !!Meteor.userId(),
	rooms: Rooms.find({ hostId: Meteor.userId() }).fetch(),
}))(Container.create(Dashboard));
