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

	getRef = node => {
		this.messageInput = node;
	};

	getUserFromId = (index, id) => {
		const requestUser = this.props.users.filter(user => id === user._id);

		let img = null;

		if (index === 0 || this.props.messages[index - 1].createdBy !== id) {
			img = (
				<img
					className="chatbox__message__avatar"
					src={requestUser[0].profile.picture}
					alt={`${requestUser[0].profile.name} avatar`}
				/>
			);
		}

		return img;
	};

	openChatbox = () => {
		toggleChatbox();
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

	checkUserTyping = e => {
		if (e.keyCode === 13) {
			this.submitMessage();
		}
	};

	render() {
		const { isChatboxOpen } = this.state;
		const { messages } = this.props;

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
									{messages &&
										messages.map((message, index) => (
											<li
												className={`chatbox__message-container ${
													message.createdBy === Meteor.userId() ? 'chatbox__message--self' : ''
												}`}
												key={message._id}
											>
												<div className="chatbox__message__content-wrapper">
													<div className="chatbox__message__avatar-wrapper">
														{this.getUserFromId(index, message.createdBy)}
													</div>

													<span className="chatbox__message__content">{message.message}</span>
												</div>
											</li>
										))}
								</ul>
							</div>
							<form className="chatbox__composer" action="">
								<textarea
									placeholder="Type a message"
									className="chatbox__composer__content"
									name="message"
									type="text"
									ref={this.getRef}
									onKeyDown={this.checkUserTyping}
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
