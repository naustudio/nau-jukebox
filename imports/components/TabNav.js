/* © 2017
 * @author Tu Nguyen
 */

/* eslint-disable react/no-array-index-key */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { withTracker } from 'meteor/react-meteor-data';
import ReactGA from 'react-ga';

import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import AccountsUIWrapper from './AccountUIWrapper';
import { changeTab, toggleSearch } from '../events/AppActions';

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

	state = {
		navbarIsShown: false,
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevState.tabIndex !== this.state.tabIndex) {
			ReactGA.event({
				category: 'Navigation',
				action: 'Switched tab',
				label: this.tabList[this.state.tabIndex],
			});
		}
	}

	onTabClick = e => {
		const index = parseInt(e.currentTarget.dataset.index, 10);
		changeTab(index);

		if (this.state.navbarIsShown) {
			this.toggleNavbar();
		}
	};

	tabList = ['Play List', 'Yesterday', 'Last 7 day', 'Top Lists', 'Users', 'My Bookings'];
	_renderTabNav = () => {
		const lst = this.tabList.map((item, index) => {
			const listItem = (
				<li
					key={index}
					data-index={index}
					className={`tab__nav__list-item ${this.state.tabIndex === index ? 'tab__nav__list-item--active' : ''}`}
					onClick={this.onTabClick}
				>
					<a href="#">{item}</a>
				</li>
			);

			if (index !== 5) {
				return listItem;
			} else if (this.props.isSignedIn) {
				return listItem;
			}

			return '';
		});

		return lst;
	};

	toggleNavbar = () => {
		this.setState({
			navbarIsShown: !this.state.navbarIsShown,
		});
	};

	render() {
		return (
			<nav className="tab__nav noselect">
				<div className="container tab__nav__container tab__nav--mobile-no-pd">
					<ul className={`tab__nav__playlist ${this.state.navbarIsShown ? 'tab__nav__playlist--active' : ''}`}>
						{this._renderTabNav()}
					</ul>
					<div className="tab__nav__login-outter login-block">
						<AccountsUIWrapper />

						<div className="tab__nav__buttons-wrapper">
							<i
								className="fa fa-search tab__nav__search nau--hidden-md nau--hidden-lg"
								aria-hidden="true"
								onClick={toggleSearch}
							/>
							<button
								className={`tab__nav__button tab__collapse nau--hidden-md nau--hidden-lg`}
								onClick={this.toggleNavbar}
							>
								<i className="fa fa-bars tab__nav__icon" aria-hidden="true" />
							</button>
						</div>

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
