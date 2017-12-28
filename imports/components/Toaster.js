/* © 2017 NauStud.io
 * @author Eric
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Toaster extends Component {
	static propTypes = {
		open: PropTypes.bool,
		text: PropTypes.string,
		time: PropTypes.number,
		type: PropTypes.oneOf(['success', 'error']),
		onClose: PropTypes.func.isRequired,
	};

	static defaultProps = {
		open: false,
		text: 'Toaster',
		time: 3000,
		type: 'success',
	};

	componentWillReceiveProps(nextProps) {
		if (nextProps.open !== this.props.open && nextProps.open) {
			clearTimeout(this.timeout);
			if (nextProps.type === 'success') {
				this.timeout = setTimeout(() => {
					this.props.onClose();
				}, this.props.time);
			}
		}
	}

	timeout;

	render() {
		const { open, text, type, onClose } = this.props;

		return (
			<div className={`toaster ${open ? 'toaster--open' : ''} toaster--${type}`} onClick={onClose}>
				<span>{text}</span>
			</div>
		);
	}
}

export default Toaster;
