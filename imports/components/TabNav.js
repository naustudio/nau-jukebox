/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import { Container } from 'flux/utils';
import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
import { changeTab, signInUser, closeBtnNav } from '../events/AppActions';

class TabNav extends Component {

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(prevState) {
		return {
			isSignIn: UserStore.getState()['isSignIn'],
			userName: UserStore.getState()['userName'],
			errorSignIn: UserStore.getState()['errorSignIn'],
			toggleBtnNav: AppStore.getState()['toggleBtnNav'],
			tabIndex: AppStore.getState()['tabIndex'],
		};
	}

	onTabClick = (e) => {
		const index = parseInt(e.currentTarget.dataset.index, 10);
		changeTab(index);
	}

	signInUser = (e) => {
		signInUser('f');
	}

	tabList = ['Play List', 'Yesterday', 'Last 7 day', 'Top Lists', 'Users'];
	_renderTabNav = () => {
		console.log('Tab nav', this.state.tabIndex);
		const lst = this.tabList.map((item, index) => (
			<li
				key={item} data-index={index}
				className={`tab__nav__list-item ${this.state.tabIndex === index ? 'tab__nav__list-item--active' : ''}`}
				onClick={this.onTabClick}
			>
				<a href="#play-list">{item}</a>
			</li>));

		return (lst);
	}

	render() {

		return (
			<nav className="tab__nav">
				<div className="container tab__nav__container">
					<ul className="tab__nav__playlist">
						{this._renderTabNav()}
					</ul>
					<div className="tab__nav__login-outter">
						<div
							className="tab__nav__login-btn"
							onClick={this.signInUser}
						>
							<a href="#play-list">{this.state.userName}</a>
						</div>

						{
							this.state.errorSignIn && (
								<div className="tab__nav__login-error">
									<p>Please login to book songs!</p>
								</div>
							)
						}
					</div>
				</div>
			</nav>
		);
	}
}

export default Container.create(TabNav);
