/* © 2017
 * @author Tu Nguyen
 */

/* eslint-disable no-alert */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Container } from 'flux/utils';
import { isToday, isYesterday } from 'date-fns';
// import ReactGA from 'react-ga';
// import { Users } from '../collections';
import AppStore from '../events/AppStore';
import { toggleChatbox } from '../events/AppActions';
import { Messages, Users } from '../collections';

const maximumHeightOfInput = 150;

class ChatBox extends Component {
	static propTypes = {
		messages: PropTypes.arrayOf(PropTypes.shape()),
		users: PropTypes.arrayOf(PropTypes.shape()),
	};

	static defaultProps = {
		messages: [],
		users: [],
	};

	static state = {};

	static getStores() {
		return [AppStore];
	}

	static calculateState(/* prevState */) {
		return {
			currentRoom: AppStore.getState()['currentRoom'],
			isChatboxOpen: AppStore.getState()['isChatboxOpen'],
		};
	}

	state = {
		messageFormStyle: {},
		messageInputStyle: {},
	};

	componentDidUpdate() {
		const lastMessage = document.querySelector('.chatbox__message--last');
		if (lastMessage) {
			lastMessage.scrollIntoView();
		}
	}

	setRef = node => {
		if (!node) {
			return;
		}

		this[`${node.dataset.element}`] = node;

		if (node.dataset.element === 'messageInput') {
			this.baseMessageInputHeight = node.clientHeight;
			document.querySelector('.chatbox__composer__content').addEventListener('resize', this.onResize);
		}
	};

	getUserFromId = id => {
		const requestUser = this.props.users.filter(user => id === user._id);

		return requestUser;
	};

	adjustHeight = () => {
		if (this.messageInput.scrollHeight <= maximumHeightOfInput) {
			this.setState(
				{
					messageInputStyle: {
						height: 1,
					},
				},
				() => {
					this.setState({
						messageFormStyle: {
							minHeight: this.messageInput.scrollHeight,
						},
						messageInputStyle: {
							height: this.messageInput.scrollHeight,
						},
					});
				}
			);
		} else {
			this.setState({
				messageInputStyle: {
					overflowY: 'scroll',
				},
			});
		}
	};

	resetHeight = () => {
		this.setState({
			messageFormStyle: {},
			messageInputStyle: {},
		});
	};

	checkUserTyping = e => {
		if (e.keyCode === 13 && !e.shiftKey) {
			e.preventDefault();
			this.submitMessage();
		}
	};

	submitMessage = () => {
		const message = this.messageInput.value.trim();

		if (message !== '') {
			Meteor.call('sendMessage', message, Meteor.userId(), this.state.currentRoom._id, err => {
				if (err) {
					console.log(err);
				} else {
					this.messageInput.value = '';
					this.resetHeight();
				}
			});
		}
	};

	toggleChatbox = () => {
		if (this.state.isChatboxOpen) {
			this.content = this.messageInput.value;

			this.resetHeight();
		}

		toggleChatbox();
	};

	renderMessage = (message, index) => {
		let messageClass = '';
		let messageSpacing = '';
		const requestUser = this.getUserFromId(message.createdBy);
		let img = null;
		let time = '';
		const messageDate = new Date(message.createdAt);

		if (message.createdBy === Meteor.userId()) {
			messageClass = 'chatbox__message-self';
		} else {
			messageClass = 'chatbox__message-other';
		}

		if (index !== 0 && this.props.messages[index - 1].createdBy !== message.createdBy) {
			messageSpacing = 'chatbox__message--separator';
		}

		if (index === this.props.messages.length - 1) {
			messageSpacing += 'chatbox__message--last';
		}

		if ((index === 0 || this.props.messages[index - 1].createdBy !== message.createdBy) && requestUser[0]) {
			img = (
				<img
					className={`${messageClass}__avatar`}
					src={requestUser[0].profile.picture}
					alt={`${requestUser[0].profile.name} avatar`}
					title={requestUser[0].profile.name}
				/>
			);
		}

		if (isToday(messageDate)) {
			time = `Today ${messageDate.getHours()}:${messageDate.getMinutes()}`;
		} else if (isYesterday(messageDate)) {
			time = `Yesterday ${messageDate.getHours()}:${messageDate.getMinutes()}`;
		} else {
			time = `${messageDate.getDate} ${messageDate.getMonth} ${messageDate.getHours()}:${messageDate.getMinutes()}`;
		}

		return (
			<li className={`${messageClass}__container ${messageClass} ${messageSpacing}`} key={message._id}>
				<div className={`${messageClass}__content-wrapper`}>
					<div className={`${messageClass}__avatar-wrapper`}>{img}</div>
					<span className={`${messageClass}__content`} title={time}>
						{message.message}
					</span>
				</div>
			</li>
		);
	};

	render() {
		const { isChatboxOpen, messageFormStyle, messageInputStyle } = this.state;
		const { messages } = this.props;

		return (
			<div className={`chatbox ${isChatboxOpen ? 'chatbox--shown' : ''}`}>
				{isChatboxOpen ? (
					<div className="chatbox-container">
						<div className="chatbox__tab" onClick={this.toggleChatbox}>
							<span className="chatbox__title">Chatbox</span>
							<i className="fa fa-angle-down chatbox__close-icon" />
						</div>

						<div className="chatbox__conversation-container">
							<div className="chatbox__conversation-inner">
								<div className="chatbox__conversation-content">
									<ul className="chatbox__message-list" data-element="messageList" ref={this.setRef}>
										{messages && messages.map((message, index) => this.renderMessage(message, index))}
									</ul>
								</div>
								<form className="chatbox__composer" action="" style={messageFormStyle}>
									<textarea
										placeholder="Type and press [enter].."
										className="chatbox__composer__content"
										name="message"
										type="text"
										data-element="messageInput"
										ref={this.setRef}
										onChange={this.adjustHeight}
										onKeyDown={this.checkUserTyping}
										style={messageInputStyle}
									/>
								</form>
							</div>
						</div>
					</div>
				) : (
					<div className="chatbox__icon-opener-container" onClick={this.toggleChatbox}>
						<i className="fa fa-comments chatbox__icon-opener" aria-hidden="true" />
					</div>
				)}
			</div>
		);
	}
}

export default withTracker(({ currentRoom }) => ({
	messages: Messages.find(
		{
			roomId: currentRoom && currentRoom._id,
		},
		{
			sort: { timeAdded: 1 },
		}
	).fetch(),
	users: Users.find(
		{
			services: { $exists: true },
			roomId: currentRoom ? currentRoom._id : '',
		},
		{
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
}))(Container.create(ChatBox));
