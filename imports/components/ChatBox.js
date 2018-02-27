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
import { Messages /* AppStates */ } from '../collections';

class ChatBox extends Component {
	static propTypes = {
		messages: PropTypes.arrayOf(PropTypes.shape()),
	};

	static defaultProps = {
		messages: [],
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

	openChatbox = () => {
		toggleChatbox();
	};

	submitMessage = e => {
		e.preventDefault();

		const message = e.currentTarget.message.value;

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
										messages.map(message => (
											<li
												className={`chatbox__message-container ${
													message.createdBy === Meteor.userId() ? 'chatbox__message--self' : ''
												}`}
												key={message._id}
											>
												<span className="chatbox__message__content">{message.message}</span>
											</li>
										))}
								</ul>
							</div>
							<form className="chatbox__composer" action="" onSubmit={this.submitMessage}>
								<textarea
									rows="10"
									col="1"
									className="chatbox__composer__content"
									name="message"
									type="text"
									ref={this.getRef}
								/>
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

export default withTracker(({ currentRoom }) => ({
	messages: Messages.find(
		{
			roomId: currentRoom && currentRoom._id,
		},
		{
			limit: 10,
			sort: { timeAdded: -1 },
		}
	).fetch(),
}))(Container.create(ChatBox));
