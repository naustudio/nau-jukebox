/* © 2017
 * @author Eric
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

const withTracker = (WrappedComponent, options = {}) => {
	const trackPage = page => {
		ReactGA.set({
			page,
			...options,
		});
		ReactGA.pageview(page);
	};

	const HOC = class extends Component {
		static propTypes = {
			location: PropTypes.shape({
				pathname: PropTypes.string,
			}).isRequired,
		};
		componentDidMount() {
			const page = this.props.location.pathname;
			trackPage(page);
		}

		componentWillReceiveProps(nextProps) {
			const currentPage = this.props.location.pathname;
			const nextPage = nextProps.location.pathname;

			if (currentPage !== nextPage) {
				trackPage(nextPage);
			}
		}

		render() {
			return <WrappedComponent {...this.props} />;
		}
	};

	return HOC;
};

export default withTracker;
