/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class PopupForm extends Component {
	static propTypes = { id: PropTypes.string, onSubmit: PropTypes.func, onClose: PropTypes.func };

	static defaultProps = { id: '', onSubmit: undefined, onClose: undefined };

	state = {};

	componentDidMount() {
		const input = document.querySelector('#input-popup-js');
		input.focus();
	}

	setRef = node => {
		this.popupBackDrop = node;
	};

	checkClickOutside = e => {
		if (e.target === this.popupBackDrop) {
			this.props.onClose();
		}
	};

	render() {
		const { onSubmit, id, onClose } = this.props;

		return (
			<section className="users__popover-backdrop" ref={this.setRef} onClick={this.checkClickOutside}>
				<div className="users__popover">
					<i className="fa fa-times users__popover__icon" aria-hidden="true" data-id={id} onClick={onClose} />
					<div className="users__popover__form">
						<form onSubmit={onSubmit} className="users__popover__form">
							<input
								className="users__item__payment__input"
								type="number"
								name="amount"
								id="input-popup-js"
								placeholder="AMOUNT OF PAYMENT (+/-)"
							/>
							<input hidden value={id} readOnly type="text" name="userid" />
							<input className="btn btn--primary users__item__payment__submit" type="submit" defaultValue="Submit" />
						</form>
					</div>
				</div>
			</section>
		);
	}
}
