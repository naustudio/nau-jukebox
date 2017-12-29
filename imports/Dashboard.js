/* © 2017
 * @author Eric
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'flux/utils';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';

import blockWords from './helpers/block-words.json';
import { errorSignInDashboard } from './events/AppActions';
import { Rooms, Users } from './collections';
import AccountsUIWrapper from './components/AccountUIWrapper';
import AppStore from './events/AppStore';
import UserStore from './events/UserStore';
import Toaster from './components/Toaster';

class Dashboard extends Component {
	static propTypes = {
		isSignedIn: PropTypes.bool,
		history: PropTypes.shape({
			push: PropTypes.func,
		}),
		rooms: PropTypes.arrayOf(PropTypes.object),
	};

	static defaultProps = {
		isSignedIn: false,
		history: null,
		rooms: [],
	};

	static getStores() {
		return [AppStore, UserStore];
	}

	static calculateState(/*prevState*/) {
		return {
			errorSignIn: UserStore.getState()['errorSignInDashboard'],
		};
	}

	state = {
		toasterOpen: false,
		toasterText: 'Toaster',
	};

	onInputName = e => {
		const input = e.target;
		const blockCharacter = /[!@#$%^&*()+=_{}[\]|\\/:;"'><?~`,.]/g;
		let usingBlockWordFlag = false;

		if (blockCharacter.test(input.value)) {
			input.setCustomValidity("Use only alphanumeric characters, space or '-'");

			return;
		}

		blockWords.forEach(word => {
			if (input.value.indexOf(word) > -1) {
				usingBlockWordFlag = true;
			}
		});

		if (usingBlockWordFlag) {
			input.setCustomValidity('You are using block words. Please try a different name');
		} else {
			input.setCustomValidity('');
		}
	};

	onCreateRoom = e => {
		e.preventDefault();
		if (!this.props.isSignedIn) {
			errorSignInDashboard();

			return;
		}

		const form = e.currentTarget;
		if (form.name && form.name.value) {
			Meteor.call('createRoom', form.name.value, Meteor.userId(), (err, id) => {
				if (err) {
					this.setState({
						toasterText: err.toString(),
						toasterOpen: true,
					});
				} else {
					ReactGA.event({
						category: 'Host',
						action: 'Created a Room',
					});
					this.props.history.push(`/room/${Rooms.findOne(id).slug}`);
				}
			});
		}
	};

	onToasterClose = () => {
		this.setState({
			toasterOpen: false,
		});
	};

	render() {
		const { rooms, isSignedIn } = this.props;
		const { errorSignIn, toasterOpen, toasterText } = this.state;

		return (
			<div className="dashboard">
				<img src="/nau-jukebox.svg" alt="nau jukebox logo" className="dashboard__logo" />
				<div className="dashboard__content">
					<div className="dashboard__login-block">
						<AccountsUIWrapper />
						{errorSignIn && !isSignedIn ? (
							<div className="dashboard__login-block__error">
								<p>Please login first!</p>
							</div>
						) : null}
					</div>
					{rooms && rooms.length ? (
						<div className="dashboard__room-container">
							<h5 className="dashboard__room-header">Joined Rooms</h5>
							<ul className="dashboard__room-list">
								{rooms.map(room => (
									<li className="dashboard__room" key={room._id}>
										<span className="dashboard__room-name">{room.name}</span>
										<Link to={`/room/${room.slug}`} className="dashboard__join-button button">
											{Meteor.userId() === room.hostId ? 'JOIN AS HOST' : 'JOIN'}
										</Link>
									</li>
								))}
							</ul>
						</div>
					) : null}
					<form className="dashboard__add-room" onSubmit={this.onCreateRoom}>
						<label>NEW ROOM</label>
						<input type="text" placeholder="Room name" required name="name" minLength="4" onInput={this.onInputName} />
						<button type="submit" className="dashboard__create-button">
							CREATE
						</button>
					</form>
				</div>
				<Toaster type="error" open={toasterOpen} text={toasterText} onClose={this.onToasterClose} />
				<hr />
				<details>
					<summary>Introduction / Giới thiệu</summary>
					<p>
						A simple web app which allows group of people (co-workers, friends gathering, house-mates) collectively book
						and play continuously a list of songs.
					</p>
					<p>
						(TV) Đây là một ứng dụng web đơn giản cho phép một nhóm user cùng đăng ký bài hát vào một danh sách chung và
						nghe cùng với nhau. Nâu Jukebox rất phù hợp với một nhóm người đang nghe nhạc cùng nhau: tại công sở, quán
						cà phê, bạn bè cùng lớp, cùng phòng...
					</p>
				</details>
				<details>
					<summary>How to?</summary>
					<ul>
						<li>First user login with either Facebook or Google account.</li>
						<li>First user will create a room for the group and become the room&#039;s host.</li>
						<li>Once the room is created, everyone can join the room by visiting the unique URL.</li>
						<li>To book songs, users must login.</li>
						<li>Copy the URL to a single song from supported services and paste it to the search box.</li>
						<li>Or search from known songs in Nau Jukebox database and book quickly.</li>
						<li>
							Supported services whose song can be book from:
							<ul>
								<li>
									<a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
										youtube.com
									</a>
								</li>
								<li>
									<a href="https://soundcloud.com" target="_blank" rel="noopener noreferrer">
										soundcloud.com
									</a>
								</li>
								<li>
									<a href="https://www.nhaccuatui.com" target="_blank" rel="noopener noreferrer">
										nhaccuatui.com
									</a>
								</li>
								<li>
									<a href="https://mp3.zing.vn" target="_blank" rel="noopener noreferrer">
										mp3.zing.vn
									</a>
								</li>
							</ul>
						</li>
					</ul>
				</details>
				<details>
					<summary>Hướng dẫn</summary>
					<ul>
						<li>Đầu tiên bạn cần phải đăng nhập với tài khoản Facebook hoặc Google</li>
						<li>Tiếp theo, bạn tạo một phòng nghe nhạc chung, và trở thành Host (chủ phòng).</li>
						<li>
							Một khi phòng nghe nhạc đã được tạo, mọi người đều có thể vào phòng xem danh sách bài hát thông qua một
							địa chỉ URL dành riêng cho Phòng.
						</li>
						<li>
							Để đăng ký bài hát, các user khác cần đăng nhập. Danh sách những user đã đăng nhập vào phòng sẽ hiện lên
							bên danh sách Users.
						</li>
						<li>
							Copy đường link trên thanh địa chỉ tại trang bài hát (trang đơn, không phải playlist) của một trong các
							website nghe nhạc được hỗ trợ.
						</li>
						<li>Dán vào ô tìm kiếm và Enter (hoặc bấm Search)</li>
						<li>
							<strong>HOẶC</strong> bạn có thể nhập vào từ khoá để tìm kiếm bài hát sẵng có trong cơ sở dữ liệu của
							Jukebox.
						</li>
						<li>
							Các trang nghe nhạc đang được hỗ trợ là:
							<ul>
								<li>
									<a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
										youtube.com
									</a>
								</li>
								<li>
									<a href="https://soundcloud.com" target="_blank" rel="noopener noreferrer">
										soundcloud.com
									</a>
								</li>
								<li>
									<a href="https://www.nhaccuatui.com" target="_blank" rel="noopener noreferrer">
										nhaccuatui.com
									</a>
								</li>
								<li>
									<a href="https://mp3.zing.vn" target="_blank" rel="noopener noreferrer">
										mp3.zing.vn
									</a>
								</li>
							</ul>
						</li>
					</ul>
				</details>
			</div>
		);
	}
}

export default withTracker(() => {
	const _id = Meteor.userId();
	let joinedRooms = [];
	const currentUser = Meteor.userId() ? Users.findOne({ _id }) : undefined;
	joinedRooms = (currentUser && currentUser.joinedRooms) || [];

	return {
		isSignedIn: !!Meteor.userId(),
		rooms: Rooms.find({ _id: { $in: joinedRooms } }).fetch(),
	};
})(Container.create(Dashboard));
