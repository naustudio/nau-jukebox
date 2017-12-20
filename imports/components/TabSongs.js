/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'proptypes';
import { Container } from 'flux/utils';
import AppStore from '../events/AppStore';
import UserStore from '../events/UserStore';
// import SongStore from '../events/SongStore';
import * as AppActions from '../events/AppActions';

class TabSong extends Component {
	static propTypes = {
		typeSong: PropTypes.number.isRequired,
	}

	// static getStores() {
	// 	return [SongStore, AppStore, UserStore];
	// }

	static getStores() {
	}

	static calculateState(prevState) {
		return {
			// listSong: SongStore.getState()['listSong'],
			toggleBtnPlay: AppStore.getState()['toggleBtnPlay'],
			isSignIn: UserStore.getState()['isSignIn'],
			activeHost: UserStore.getState()['activeHost'],
		};
	}

	deleteSong = (e) => {
		const index = parseInt(e.currentTarget.dataset.index, 10);
		AppActions.deleleSong(index);
	}

	toggleUserBook = (e) => {
		const index = parseInt(e.currentTarget.dataset.index, 10);
		AppActions.toggleUserBook(index);
	}

	repeatSong = (e) => {
		if (this.state.isSignIn) {
			const index = parseInt(e.currentTarget.dataset.index, 10);
			AppActions.repeatSong(index);
		} else {
			AppActions.errorSignIn();
		}
	}

	activeBtnPlay = () => {
		AppActions.activeBtnPlay();
	}

	selectSong = (e) => {
		const index = e.currentTarget.dataset.index;
		this.setState({ selectSongIndex: index });
	}

	_renderSong = () => {

		// const lst = this.state.listSong && this.state.listSong.filter((item) => item.type === this.props.typeSong)
		// 	.map((item, index) => (
		// 		<li key={index} data-index={item.id}
		// 			className={`row song__item ${this.state.playSongIndex === String(index) ? 'song__item--playing' : ''}`}
		// 		>
		// 			<span className={`song__item__author ${item.toggleUserBook ? 'song__item__author--active' : ''}`}>
		// 				{item.id} Phạm Thanh Huyền Phạm Thanh Huyền
		// 			</span>
		// 			<i
		// 				className="fa fa-caret-right song__item__mark"
		// 				aria-hidden="true"
		// 			/>
		// 			<div className="col col--8 song__item__info">
		// 				<div className="song__item__avt">
		// 					<img
		// 						src="https://thumbs.dreamstime.com/t/imge-mint-closeup-green-leaves-texture-background-72159554.jpg"
		// 						width={40}
		// 						height={40}
		// 						alt="image song"
		// 					/>
		// 				</div>
		// 				<a
		// 					href="#"
		// 					className="song__item__link"
		// 					title="Hương Tràm - Em Gái Mưa ( Anh Khang Cover ) - YouTube"
		// 					data-index={item.id}
		// 					onClick={this.activeBtnPlay}
		// 				>
		// 					Hương Tràm - Em Gái Mưa ( Anh Khang Cover ) -
		// 					YouTubeTràm - Em Gái Mưa ( Anh Khang Cover ) - YouTube
		// 				</a>
		// 			</div>
		// 			{/* /.col col--4 song__item__info */}
		// 			<div className="col col--4 song__item__control">
		// 				<div className="song__item__time">4 hours ago</div>
		// 				{(() => {
		// 					if (this.state.activeHost) {
		// 						return (
		// 							<a
		// 								href="#"
		// 								className="song__item__book-user"
		// 								data-index={item.id}
		// 								onClick={this.toggleUserBook}
		// 							>
		// 								<i className="fa fa-eye" aria-hidden="true" />
		// 							</a>
		// 						);
		// 					}
		// 				})()}
		// 				<a
		// 					href="#"
		// 					className="song__item__lyric"
		// 					data-index={item.id}
		// 					onClick={AppActions.openPopUp}
		// 				>
		// 					<i className="fa fa-file-text" aria-hidden="true" />
		// 				</a>
		// 				<a
		// 					href="#"
		// 					className="song__item__repeat"
		// 					data-index={item.id}
		// 					onClick={this.repeatSong}
		// 				>
		// 					<i className="fa fa-retweet" aria-hidden="true" />
		// 				</a>
		// 				{(() => {
		// 					if (this.state.activeHost) {
		// 						return (
		// 							<a
		// 								href="#"
		// 								className="song__item__remove"
		// 								data-index={index}
		// 								onClick={this.deleteSong}
		// 							>
		// 								<i className="fa fa-times" aria-hidden="true" />
		// 							</a>
		// 						);
		// 					}
		// 				})()}
		// 			</div>
		// 			{/* /.col col--4 song__item__control */}
		// 		</li>
		// 	));

		// return (lst);
	}

	render() {
		return (
			<section className="tab__body song">
				<div className="container song__container">
					<ul className="song__list">
						{this._renderSong()}
					</ul>
					{/* /.song__list */}
				</div>
				{/* /.container */}
			</section>
		);
	}
}

export default Container.create(TabSong);
