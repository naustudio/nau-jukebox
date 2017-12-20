/* © 2017
 * @author Eric Tran
 */

import React, { Component } from 'react';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

export default class AccountsUIWrapper extends Component {
	componentDidMount() {
		// Use Meteor Blaze to render login buttons
		this.view = Blaze.render(Template.loginButtons, this.container);
	}

	componentWillUnmount() {
		// Clean up Blaze view
		Blaze.remove(this.view);
	}

	refContainer = (ref) => {
		this.container = ref;
	}

	render() {
		// Just render a placeholder container that will be filled in
		return <span ref={this.refContainer} />;
	}
}
