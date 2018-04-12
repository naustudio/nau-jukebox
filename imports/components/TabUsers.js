/* © 2017
 * @author Tu Nguyen
 */

/* eslint-disable no-alert */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Container } from 'flux/utils';
import ReactGA from 'react-ga';

import { Users } from '../collections';
import UserStore from '../events/UserStore';
import AppStore from '../events/AppStore';
import Badge from '../components/Badge';
import PopupForm from '../components/PopupForm';

class TabUsers extends Component {
	static propTypes = {
		users: PropTypes.arrayOf(PropTypes.object),
	};

	static defaultProps = {
		users: [],
	};

	static state = {
		isPopoverShow: false,
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

		if (amount) {
			ReactGA.event({
				category: 'Host',
				action: 'Set new Naucoin value',
			});
			Meteor.call('naucoinPay', userId, amount, (/*err, result*/) => {
				form.amount.value = '';

				if (this.state.isPopoverShow) {
					this.togglePopover();
				}
			});
		}
	};

	onSetHost = e => {
		const userId = e.currentTarget.dataset.userid;

		if (userId === this.state.currentRoom.hostId) {
			return;
		}

		const confirm = window.confirm('Are you sure?');
		if (confirm) {
			const { currentRoom } = this.state;
			if (userId && currentRoom) {
				ReactGA.event({
					category: 'Host',
					action: 'Assign host',
				});
				Meteor.call('changeHost', userId, currentRoom._id, err => {
					if (err) {
						console.log(err);
					}
				});
			}
		}
	};

	showBadges = user => {
		if (user.status.online && user.status.idle) {
			return <Badge message={'Idle'} type="warning" />;
		} else if (user.status.online) {
			return <Badge message={'Online'} type="success" />;
		}

		return null;
	};

	togglePopover = e => {
		if (!e || this.state.isPopoverShow) {
			this.setState({ isPopoverShow: !this.state.isPopoverShow });

			return;
		}

		const id = e.target.dataset.id;

		this.setState({
			isPopoverShow: !this.state.isPopoverShow,
			formId: id,
		});
	};

	_renderUser = () => {
		const { currentRoom } = this.state;

		const lst = this.props.users.map(user => (
			<li key={user._id} className="row users__item">
				<div className="users__item-wrapper">
					<div className="users__item__image-and-name">
						{user._id === this.state.currentRoom.hostId && (
							<div className="users__item__host-icon-wrapper">
								<i className="fa fa-user-secret users__item__host-icon" aria-hidden="true" />
							</div>
						)}
						{currentRoom && currentRoom.hostId === Meteor.userId() ? (
							<div className="users__item__checkbox">
								<span className="users__item__checkbox-container" data-userid={user._id} onClick={this.onSetHost} />
							</div>
						) : null}
						<div className="users__item__image-wrapper">
							<img src={user.profile.picture} width={50} height={50} alt="image user" className="users__item__avt" />
						</div>
						<div className="users__item__info">
							<div className="users__item__user">
								<div className="users__item__name-wrapper">
									<p className="users__item__name">{user.profile && user.profile.name}</p>
									{currentRoom && currentRoom.hostId === user._id ? <Badge type="dark" message="Host" /> : null}
									{user._id === Meteor.userId() ? <Badge type="primary" message="Me" /> : null}
									{this.showBadges(user)}
								</div>
								{currentRoom && currentRoom.hostId !== Meteor.userId() ? (
									<span className="users__item__coin">{user.balance ? user.balance.toFixed(2) : 0}</span>
								) : null}
							</div>
						</div>
					</div>

					{currentRoom && currentRoom.hostId === Meteor.userId() ? (
						<div className="users__item__payment">
							<span className="users__item__coin">{user.balance ? user.balance.toFixed(2) : 0}</span>

							<form onSubmit={this.onFormSubmit} className="nau--hidden-xxs nau--hidden-xs nau--hidden-sm">
								<div className="users__item__payment__input-wraper">
									<input
										className="users__item__payment__input"
										type="number"
										name="amount"
										id="users__item__payment__input"
										placeholder="AMOUNT OF PAYMENT (+/-)"
									/>
									<input hidden value={user._id} readOnly type="text" name="userid" />
								</div>
								<div className="col col--5">
									<input
										className="btn btn--primary users__item__payment__submit"
										type="submit"
										defaultValue="Submit"
									/>
								</div>
							</form>
							<input
								className="btn btn--primary nau--hidden-md nau--hidden-lg"
								type="button"
								defaultValue="Payment"
								data-id={`${user._id}`}
								onClick={this.togglePopover}
							/>
						</div>
					) : null}
				</div>
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
						<span>₦: Naucoin, ₦1.00 = 1.000VND</span>
					</h5>
					{currentRoom && ids.indexOf(currentRoom.hostId) < 0 ? (
						<em className="users__info">* Host is now in another room *</em>
					) : (
						''
					)}
					<ul className="users__list">{this._renderUser()}</ul>
					{this.state.isPopoverShow === true ? (
						<PopupForm id={`${this.state.formId}`} onSubmit={this.onFormSubmit} onClose={this.togglePopover} />
					) : null}
				</div>
			</section>
		);
	}
}

export default withTracker(({ currentRoom }) => ({
	users: Users.find(
		{
			services: { $exists: true },
			roomId: currentRoom ? currentRoom._id : '',
		}, // fetch only modern user, ignore legacy ones
		{
			sort: { 'status.online': -1, balance: -1 },
			transform: user => {
				let picture = `https://api.adorable.io/avatar/${user.profile.name}`;
				if (user.services) {
					if (user.services.google) {
						picture = user.services.google.picture || picture;
					} else if (user.services.goalify) {
						picture = user.services.goalify.avatar || picture;
					} else if (user.services.facebook) {
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
