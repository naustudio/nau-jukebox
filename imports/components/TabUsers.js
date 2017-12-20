/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Container } from 'flux/utils';
import UserStore from '../events/UserStore';

class TabUsers extends Component {
	static propTypes = {
		users: PropTypes.arrayOf(PropTypes.object)
	};

	static defaultProps = {
		users: []
	};

	static getStores() {
		return [UserStore];
	}

	static calculateState(prevState) {
		return {
			activeHost: UserStore.getState()['activeHost']
		};
	}

	onFormSubmit = e => {
		e.preventDefault();
		const form = e.currentTarget;
		const amount = form.amount && form.amount.value;
		const userId = form.userid && form.userid.value;
		if (amount && userId) {
			Meteor.call('naucoinPay', userId, amount, (err, result) => {
				form.amount.value = '';
			});
		}
	};

	_renderUser = () => {
		console.log(this.props.users[0]);
		const lst = this.props.users.map(user => (
			<li key={user._id} className={`row users__item ${user.isOnline ? 'users__item--active' : ''}`}>
				<img
					src="https://thumbs.dreamstime.com/t/imge-mint-closeup-green-leaves-texture-background-72159554.jpg"
					width={50}
					height={50}
					alt="image user"
					className="users__item__avt"
				/>
				<div className="users__item__info">
					<div className="users__item__user">
						<p className="users__item__name">{user.profile && user.profile.name}</p>
						<span className="users__item__coin">{parseFloat(user.balance || 0)}</span>
					</div>
				</div>
				{this.state.activeHost ? (
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
						</form>
					</div>
				) : null}
			</li>
		));

		return lst;
	};

	render() {
		return (
			<section className="tab__body users">
				<div className="container users__container">
					<h5 className="users__title">
						Users
						<span>₦: Naucoin, ₦1.00 = 1000VND</span>
					</h5>
					<ul className="users__list">{this._renderUser()}</ul>
				</div>
			</section>
		);
	}
}

export default withTracker(() => ({
	users: Users.find(
		{},
		{
			fields: { profile: 1, balance: 1 }
		}
	).fetch()
}))(Container.create(TabUsers));
