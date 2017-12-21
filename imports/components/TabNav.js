/* © 2017
 * @author Tu Nguyen
 */

/* eslint-disable react/no-array-index-key */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { withTracker } from 'meteor/react-meteor-data';
import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import AccountsUIWrapper from './AccountUIWrapper';
import { changeTab /* closeBtnNav */ } from '../events/AppActions';

class TabNav extends Component {
	static propTypes = {
		isSignedIn: PropTypes.bool,
	};

	static defaultProps = {
		isSignedIn: false,
	};

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(/*prevState*/) {
		return {
			errorSignIn: UserStore.getState()['errorSignIn'],
			toggleBtnNav: AppStore.getState()['toggleBtnNav'],
			tabIndex: AppStore.getState()['tabIndex'],
		};
	}

	onTabClick = e => {
		const index = parseInt(e.currentTarget.dataset.index, 10);
		changeTab(index);
	};

	tabList = ['Play List', 'Yesterday', 'Last 7 day', 'Top Lists', 'Users'];
	_renderTabNav = () => {
		const lst = this.tabList.map((item, index) => (
			<li
				key={index}
				data-index={index}
				className={`tab__nav__list-item ${this.state.tabIndex === index ? 'tab__nav__list-item--active' : ''}`}
				onClick={this.onTabClick}
			>
				<a href="#play-list">{item}</a>
			</li>
		));

		return lst;
	};

	render() {
		return (
			<nav className="tab__nav">
				<div className="container tab__nav__container">
					<ul className="tab__nav__playlist">{this._renderTabNav()}</ul>
					<div className="tab__nav__login-outter login-block">
						<AccountsUIWrapper />
						{this.state.errorSignIn && !this.props.isSignedIn ? (
							<div className="login-block__error">
								<p>Please login first!</p>
							</div>
						) : null}
					</div>
				</div>
			</nav>
		);
	}
}

export default withTracker(() => ({
	isSignedIn: !!Meteor.userId(),
}))(Container.create(TabNav));
