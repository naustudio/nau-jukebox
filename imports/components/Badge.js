/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Badge extends Component {
	/*
		Type: dark, warning, success
	*/
	static propTypes = { message: PropTypes.string, type: PropTypes.string };

	static defaultProps = { message: 'Notification', type: 'dark' };

	state = {};

	render() {
		const { message, type } = this.props;

		return <span className={` badge ${type} `}>{message}</span>;
	}
}
