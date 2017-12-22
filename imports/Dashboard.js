/* © 2017
 * @author Eric
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { withTracker } from 'meteor/react-meteor-data';

import { Rooms } from './collections';
import AccountsUIWrapper from './components/AccountUIWrapper';
import AppStore from './events/AppStore';
import UserStore from './events/UserStore';

class Dashboard extends Component {
	static propTypes = {
		isSignedIn: PropTypes.bool,
		rooms: PropTypes.arrayOf(PropTypes.object),
	};

	static defaultProps = {
		isSignedIn: false,
		rooms: [],
	};

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(/*prevState*/) {
		return {
			errorSignInDashboard: UserStore.getState()['errorSignInDashboard'],
		};
	}

	render() {
		const { rooms, isSignedIn } = this.props;
		const { errorSignInDashboard } = this.state;

		return (
			<div className="dashboard">
				<img src="/nau-jukebox.svg" alt="nau jukebox logo" className="dashboard__logo" />
				<div className="dashboard__content">
					<div className="dashboard__login-block">
						<AccountsUIWrapper />
						{errorSignInDashboard && !isSignedIn ? (
							<div className="login-block__error">
								<p>Please login first!</p>
							</div>
						) : null}
					</div>
					<div className="dashboard__room-list">
						{rooms.map(room => (
							<div className="dashboard__room">
								<span className="dashboard__room-name">{room.name}</span>
								<a href={`/rooms/${room.slug}`} className="dashboard__join-button button">
									JOIN
								</a>
							</div>
						))}
					</div>
					<form className="dashboard__add-room">
						<input type="text" placeholder="Room name" />
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
	rooms: Rooms.find({}),
}))(Container.create(Dashboard));
