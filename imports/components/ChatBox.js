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
import { Messages, Users } from '../collections';

const maximumHeightOfInput = 140;
const baseHeightOfInput = 40;

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

	static calculateState(/*prevState*/) {
		return {
			currentRoom: AppStore.getState()['currentRoom'],
			isChatboxOpen: AppStore.getState()['isChatboxOpen'],
		};
	}

	state = {
		messageListStyle: {},
		messageComposerStyle: {},
		messageInputStyle: {},
	};

	setRef = node => {
		if (!node) {
			return;
		}

		this[`${node.dataset.element}`] = node;

		if (node.dataset.element === 'messageInput') {
			this.messageInputPrevHeight = this.messageInput.scrollHeight;
		}
	};

	getUserFromId = (index, id, className) => {
		const requestUser = this.props.users.filter(user => id === user._id);

		let img = null;

		if (index === 0 || this.props.messages[index - 1].createdBy !== id) {
			img = (
				<img
					className={`${className}__avatar`}
					src={requestUser[0].profile.picture}
					alt={`${requestUser[0].profile.name} avatar`}
				/>
			);
		}

		return img;
	};

	changeHeight(composerHeight) {
		const numberOfSpace = composerHeight - this.messageInputPrevHeight;

		if (composerHeight < maximumHeightOfInput) {
			this.setState({
				messageListStyle: {
					maxHeight: this.messageList.clientHeight - numberOfSpace,
				},
				messageComposerStyle: {
					height: composerHeight,
				},
				messageInputStyle: {
					overflowY: composerHeight === baseHeightOfInput && 'hidden',
				},
			});
			this.messageInputPrevHeight = composerHeight;
		} else {
			this.setState({
				messageComposerStyle: {
					height: this.messageInputPrevHeight,
				},
				messageInputStyle: {
					overflowY: 'scroll',
				},
			});
		}
	}

	checkUserTyping = e => {
		if (e.keyCode === 13 && !e.shiftKey) {
			this.submitMessage();
			this.changeHeight(baseHeightOfInput);
		} else if (this.messageInputPrevHeight !== this.messageInput.scrollHeight) {
			this.changeHeight(this.messageInput.scrollHeight);
		}
	};

	submitMessage = () => {
		const message = this.messageInput.value;

		if (message !== '') {
			Meteor.call('sendMessage', message, Meteor.userId(), this.state.currentRoom._id, err => {
				if (err) {
					console.log(err);
				} else {
					this.messageInput.value = '';
				}
			});
		}
	};

	openChatbox = e => {
		if (
			(e.currentTarget.dataset.section === 'chatbox__tab' && !this.state.isChatboxOpen) ||
			(e.currentTarget.dataset.section === 'chatbox__icon' && this.state.isChatboxOpen)
		) {
			toggleChatbox();
		}
	};

	renderMessage = (message, index) => {
		let messageClass = '';
		let messageSpacing = '';

		if (message.createdBy === Meteor.userId()) {
			messageClass = 'chatbox__message-self';
		} else {
			messageClass = 'chatbox__message-other';
		}

		if (index !== 0 && this.props.messages[index - 1].createdBy !== message.createdBy) {
			messageSpacing = 'chatbox__message--separator';
		}

		return (
			<li className={`${messageClass}__container ${messageClass} ${messageSpacing}`} key={message._id}>
				<div className={`${messageClass}__content-wrapper`}>
					<div className={`${messageClass}__avatar-wrapper`}>
						{this.getUserFromId(index, message.createdBy, messageClass)}
					</div>

					<span className={`${messageClass}__content`}>{message.message}</span>
				</div>
			</li>
		);
	};

	render() {
		const { isChatboxOpen, messageComposerStyle, messageListStyle, messageInputStyle } = this.state;
		const { messages } = this.props;

		return (
			<div className="chatbox">
				<div
					className={`chatbox__tab ${isChatboxOpen ? 'chatbox__tab--no-hover' : ''}`}
					onClick={this.openChatbox}
					data-section="chatbox__tab"
				>
					<span className="chatbox__title">Chatbox</span>
					<span className="chatbox__icon-wrapper" onClick={this.openChatbox} data-section="chatbox__icon">
						<i className={`fa fa-angle-${isChatboxOpen ? 'down' : 'up'} chatbox__icon`} />
					</span>
				</div>

				{isChatboxOpen && (
					<div className="chatbox__conversation-container">
						<div className="chatbox__conversation-inner">
							<div className="chatbox__conversation-content">
								<ul
									className="chatbox__message-list"
									data-element="messageList"
									ref={this.setRef}
									style={messageListStyle}
								>
									{messages && messages.map((message, index) => this.renderMessage(message, index))}
								</ul>
							</div>
							<form
								className="chatbox__composer"
								action=""
								data-element="messageComposer"
								ref={this.setRef}
								style={messageComposerStyle}
							>
								<textarea
									placeholder="Type and press [enter].."
									className="chatbox__composer__content"
									name="message"
									type="text"
									data-element="messageInput"
									ref={this.setRef}
									onKeyDown={this.checkUserTyping}
									onKeyUp={this.checkUserTyping}
									style={messageInputStyle}
								/>
							</form>
						</div>
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
