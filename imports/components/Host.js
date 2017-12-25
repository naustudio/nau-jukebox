/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import { Container } from 'flux/utils';
import UserStore from '../events/UserStore';
import { activeHost, errorSignIn } from '../events/AppActions';

class Host extends Component {
	static getStores() {
		return [UserStore];
	}

	static calculateState(/*prevState*/) {
		return {
			activeHost: UserStore.getState()['activeHost'],
		};
	}

	activeHost = () => {
		const active = this.state.activeHost;
		if (active) {
			// remove all host
			Meteor.call('changeHost', null, err => {
				// handle error here
				if (err) {
					console.log('all host removed, errs:', err);
				} else {
					activeHost(false);
				}
			});
		} else {
			// eslint-disable-next-line no-alert
			const passCode = prompt("Passcode for host is: Nau's birthday (6 digits)", '110114');
			if (passCode.toLowerCase() === '110114') {
				const userId = Meteor.userId();
				if (!userId) {
					errorSignIn();

					return;
				}
				Meteor.call('changeHost', userId, err => {
					// handle error here
					if (err) {
						console.log('changeHost done, errs:', err);
					} else {
						activeHost(true);
					}
				});
			}
		}
	};

	render() {
		return (
			<div className={`host ${this.state.activeHost ? 'host--active' : ''}`} onClick={this.activeHost}>
				<div className="dot" />
			</div>
		);
	}
}

export default Container.create(Host);
