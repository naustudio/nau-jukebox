/* © 2017
 * @author Tu Nguyen
 */

/* eslint-disable no-alert */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Container } from 'flux/utils';
// import ReactGA from 'react-ga';
// import { Users } from '../collections';
import AppStore from '../events/AppStore';
import { toggleChatbox } from '../events/AppActions';

class ChatBox extends Component {
	static propTypes = {
		users: PropTypes.arrayOf(PropTypes.object),
	};

	static defaultProps = {
		users: [],
	};

	static state = {};

	static getStores() {
		return [AppStore];
	}

	static calculateState(/*prevState*/) {
		return {
			currentRoom: AppStore.getState()['currentRoom'],
			isChatboxOpen: AppStore.getState()['isChatboxOpen'],
		};
	}

	openChatbox = () => {
		toggleChatbox();
	};

	messages = [
		{
			id: 'asdaseqwe1235',
			name: 'Tu Nguyen',
			message: 'Hello there!',
			createdTime: '1519639383',
			avatar:
				'https://cdn4.iconfinder.com/data/icons/famous-characters-add-on-vol-1-flat/48/Famous_Character_-_Add_On_1-22-32.png',
		},
		{
			id: 'asdaseqwe1235',
			name: 'Eric Tran',
			message: 'Hello there!',
			createdTime: '151961383',
			avatar:
				'https://cdn4.iconfinder.com/data/icons/famous-characters-add-on-vol-1-flat/48/Famous_Character_-_Add_On_1-22-32.png',
		},
		{
			id: 'asdaseqwe1235',
			name: 'Thanh Tran',
			message: 'Hello there!',
			createdTime: '1519631283',
			avatar:
				'https://cdn4.iconfinder.com/data/icons/famous-characters-add-on-vol-1-flat/48/Famous_Character_-_Add_On_1-22-32.png',
		},
	];

	renderMessages = () => {
		this.messages.forEach(message => (
			<li className="chatbox__message-container">
				<img className="chatbox__message__avatar" src={message.avatar} alt={`${message.name} avatar`} />
				<span className="chatbox__message__content">{message.message}</span>
			</li>
		));
	};

	render() {
		const { currentRoom, isChatboxOpen } = this.state;

		console.log('this', this.messages);

		return (
			<div className="chatbox">
				<h5 className="chatbox__title" onClick={this.openChatbox}>
					Chatbox
				</h5>

				{isChatboxOpen && (
					<div className="chatbox__conversation-container">
						<div className="chatbox__conversation-inner">
							<div className="chatbox__conversation-content">
								<ul className="chatbox__message-list">
									{this.messages.map(message => (
										<li className="chatbox__message-container">
											<img className="chatbox__message__avatar" src={message.avatar} alt={`${message.name} avatar`} />
											<span className="chatbox__message__content">{message.message}</span>
										</li>
									))}
								</ul>
							</div>
							<form className="chatbox__composer" action="">
								<input className="chatbox__composer__content" type="text" />
								<button className="chatbox__composer__button" type="submit">
									Send
								</button>
							</form>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default withTracker(() => ({
	users: [],
}))(Container.create(ChatBox));
