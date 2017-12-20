/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import { Container } from 'flux/utils';
import UserStore from '../events/UserStore';

class TabUsers extends Component {
	static getStores() {
		return [UserStore];
	}

	static calculateState(prevState) {
		return {
			activeHost: UserStore.getState()['activeHost'],
			listUser: UserStore.getState()['listUser'],
		};
	}

	_renderUser = () => {
		const lst = this.state.listUser
			.map((item, index) => (
				<li key={index}
					className={`row users__item ${item.toggleUser ? 'users__item--active' : ''}`}
				>
					<img
						src="https://thumbs.dreamstime.com/t/imge-mint-closeup-green-leaves-texture-background-72159554.jpg"
						width={50}
						height={50}
						alt="image user"
						className="users__item__avt"
					/>
					<div className="users__item__info">
						<div className="users__item__user">
							<p className="users__item__name">
								Mondo Records Mondo Records Records Mondo Records
							</p>
							<span className="users__item__coin">2.00</span>
						</div>
					</div>
					{/* /.users__item__info */}
					{(() => {
						if (this.state.activeHost) {
							return (
								<div className="users__item__payment">
									<form action="#">
										<div className="users__item__payment__input-wraper">
											<label
												htmlFor="users__item__payment__input"
												className="users__item__payment__label"
											>
												AMOUNT OF PAYMENT (+/-)
											</label>
											<input
												className="users__item__payment__input"
												type="number"
												id="users__item__payment__input"
											/>
										</div>
										<div className="col col--5">
											<input
												className="btn btn--primary users__item__payment__submit"
												type="submit"
												defaultValue="Submit"
											/>
										</div>
									</form>
								</div>
								/* /.users__item__payment */
							);
						}
					})()}
				</li>
			));

		return (lst);
	}

	render() {
		return (
			<section className="tab__body users">
				<div className="container users__container">
					<h5 className="users__title">
						Users
						<span>₦: Naucoin, ₦1.00 = 1000VND</span>
					</h5>
					<ul className="users__list">
						{this._renderUser()}
					</ul>
					{/* /.users__list */}
				</div>
				{/* /.container */}
			</section>
		);
	}
}

export default Container.create(TabUsers);
