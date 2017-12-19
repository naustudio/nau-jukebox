import React, { Component } from 'react';
import { Container } from 'flux/utils';
import AppStore from '../events/AppStore';
// import { addSong, focusSearchBox } from '../events/AppActions';


class SearchBox extends Component {

	static getStores() {
		return [AppStore];
	}

	static calculateState(prevState) {
		return {
			// focusSearchBox: AppStore.getState()['focusSearchBox'],
			// isSignIn: AppStore.getState()['isSignIn'],
		};
	}

	// keyDownSearchSong = (e) => {
	// 	if (e.keyCode === 13) {
	// 		this.clickSearchSong();
	// 		e.preventDefault();
	// 	}
	// }

	// clickSearchSong = () => {
	// 	console.log(this.state.isSignIn);
	// 	if (this.state.isSignIn) {
	// 		addSong(this.refs.searchInput.value);
	// 	}
	// }

	// focusSearchBox = () => {
	// 	focusSearchBox(true);
	// }

	// blurSearchBox = () => {
	// 	focusSearchBox(false);
	// }

	render() {
		return (
			<li className="col col--7 navbar__item navbar__item--input">
				<form action="#" className={`search-box ${this.state.focusSearchBox ? 'search-box--focus' : ''}`}>
					<div className="search-box__wrap">
						<div className="search-box__input">
							<input
								type="text"
								className="search-box__input"
								placeholder="Search old song or add new NCT, Zing, YouTube, SoundClound URL"
								// onKeyDown={this.keyDownSearchSong}
								// onFocus={this.focusSearchBox}
								// onBlur={this.blurSearchBox}
								ref="searchInput"
							/>
						</div>
						<button
							type="submit"
							className="search-box__submit"
							// onClick={this.clickSearchSong}
						>
						</button>
					</div>
				</form>
			</li>
		);
	}
}

export default Container.create(SearchBox);
