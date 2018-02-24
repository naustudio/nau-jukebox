/* © 2017
 * @author Eric Tran
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Container } from 'flux/utils';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { changeTab } from '../events/AppActions';
import AppStore from '../events/AppStore';

class AccountsUIWrapper extends Component {
	static propTypes = {
		isSignedIn: PropTypes.bool,
	};

	static defaultProps = {
		isSignedIn: false,
	};

	static getStores() {
		return [AppStore];
	}

	static calculateState(/*prevState*/) {
		return {
			tabIndex: AppStore.getState()['tabIndex'],
		};
	}

	componentDidMount() {
		// Use Meteor Blaze to render login buttons
		this.view = Blaze.render(Template.loginButtons, this.container);
	}

	componentWillReceiveProps(nextProps) {
		if (!nextProps.isSignedIn && this.state.tabIndex === 5) {
			changeTab(0);
		}
	}

	componentWillUnmount() {
		// Clean up Blaze view
		Blaze.remove(this.view);
	}

	refContainer = ref => {
		this.container = ref;
	};

	render() {
		// Just render a placeholder container that will be filled in
		return <span ref={this.refContainer} />;
	}
}

export default withTracker(() => ({
	isSignedIn: !!Meteor.userId(),
}))(Container.create(AccountsUIWrapper));
