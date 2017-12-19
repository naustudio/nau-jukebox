import React, { Component } from 'react';
import PropTypes from 'proptypes';
import TabNav from './TabNav';
// import TabSong from './TabSong';
// import TabUsers from './TabUsers';
// import TabTopSong from './TabTopSong';
// import PopUpLyric from './PopUpLyric';
import { toggleBtnNav } from '../events/AppActions';


class AppBody extends Component {
	static propTypes = {
		tabIndex: PropTypes.number,
		toggleBtnNav: PropTypes.bool,
	}

	static defaultProps = {
		tabIndex: 0,
		toggleBtnNav: false,
	}


	_renderTabItem = () => {
		const index = this.props.tabIndex;
		// switch (index) {
		// 	case 0:
		// 	case 1:
		// 	case 2:
		// 		return (<TabSong typeSong={index} />);
		// 	case 3:
		// 		return (<TabTopSong />);
		// 	case 4:
		// 		return (<TabUsers />);
		// 	default:
		// 		return (<TabSong />);
		// }
	}

	render() {


		return (
			<main className="tab">
				<TabNav
					tabIndex={this.props.tabIndex}
				/>
				{ this._renderTabItem() }
				{/* <PopUpLyric /> */}

			</main>
		);
	}
}

export default AppBody;
