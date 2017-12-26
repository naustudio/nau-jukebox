/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Container } from 'flux/utils';
import { Users } from '../collections';
import UserStore from '../events/UserStore';
import AppStore from '../events/AppStore';

class TabUsers extends Component {
	static propTypes = {
		users: PropTypes.arrayOf(PropTypes.object),
	};

	static defaultProps = {
		users: [],
	};

	static getStores() {
		return [UserStore, AppStore];
	}

	static calculateState(/*prevState*/) {
		return {
			currentRoom: AppStore.getState()['currentRoom'],
		};
	}

	onFormSubmit = e => {
		e.preventDefault();
		const form = e.currentTarget;
		const amount = form.amount && form.amount.value;
		const userId = form.userid && form.userid.value;
		if (amount && userId) {
			Meteor.call('naucoinPay', userId, amount, (/*err, result*/) => {
				form.amount.value = '';
			});
		}
	};

	onSetHost = e => {
		const confirm = window.confirm('Are you sure?');
		if (confirm) {
			const userId = e.currentTarget.dataset.userid;
			const { currentRoom } = this.state;
			if (userId && currentRoom) {
				Meteor.call('changeHost', userId, currentRoom._id, err => {
					if (err) {
						console.log(err);
					}
				});
			}
		}
	};

	_renderUser = () => {
		const { currentRoom } = this.state;
		const lst = this.props.users.map(user => (
			<li key={user._id} className={`row users__item ${user.status.online ? 'users__item--active' : ''}`}>
				<div className="users__item__image-wrapper">
					{user._id === this.state.currentRoom.hostId && (
						<div className="users__item__host-icon-wrapper">
							<i className="fa fa-user-secret users__item__host-icon" aria-hidden="true" />
						</div>
					)}

					<img src={user.profile.picture} width={50} height={50} alt="image user" className="users__item__avt" />
				</div>
				<div className="users__item__info">
					<div className="users__item__user">
						<p className="users__item__name">{user.profile && user.profile.name}</p>
						<span className="users__item__coin">{user.balance ? user.balance.toFixed(2) : 0}</span>
					</div>
				</div>
				{currentRoom && currentRoom.hostId === Meteor.userId() ? (
					<div className="users__item__payment">
						<form onSubmit={this.onFormSubmit}>
							<div className="users__item__payment__input-wraper">
								<label htmlFor="users__item__payment__input" className="users__item__payment__label">
									AMOUNT OF PAYMENT (+/-)
								</label>
								<input
									className="users__item__payment__input"
									type="number"
									name="amount"
									id="users__item__payment__input"
								/>
								<input hidden value={user._id} readOnly type="text" name="userid" />
							</div>
							<div className="col col--5">
								<input className="btn btn--primary users__item__payment__submit" type="submit" defaultValue="Submit" />
							</div>
							{user._id !== this.state.currentRoom.hostId ? (
								<div className="col col--5">
									<button
										data-userid={user._id}
										className="btn btn--danger users__item__payment__submit"
										onClick={this.onSetHost}
									>
										Set as HOST
									</button>
								</div>
							) : null}
						</form>
					</div>
				) : null}
			</li>
		));

		return lst;
	};

	render() {
		const ids = this.props.users.map(u => u._id);
		const { currentRoom } = this.state;

		return (
			<section className="tab__body users">
				<div className="container users__container">
					<h5 className="users__title">
						Users
						<span>₦: Naucoin, ₦1.00 = 1000VND</span>
					</h5>
					{ids.indexOf(currentRoom.hostId) < 0 ? <em className="users__info">* Host is now in another room *</em> : ''}
					<ul className="users__list">{this._renderUser()}</ul>
				</div>
			</section>
		);
	}
}

export default withTracker(({ currentRoom }) => ({
	users: Users.find(
		{ roomId: currentRoom ? currentRoom._id : '' },
		{
			sort: { 'status.online': -1, balance: -1 },
			transform: user => {
				let picture = `https://api.adorable.io/avatar/${user.profile.name}`;
				if (user.services) {
					if (user.services.google) {
						picture = user.services.google.picture || '';
					} else {
						picture = `https://graph.facebook.com/v2.10/${user.services.facebook.id}/picture?type=square`;
					}
				}
				/* eslint-disable no-param-reassign */
				user.profile.picture = picture;

				return user;
			},
		}
	).fetch(),
}))(Container.create(TabUsers));
