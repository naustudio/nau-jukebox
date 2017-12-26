import React, { Component } from 'react';
import { Container } from 'flux/utils';
import AppStore from '../events/AppStore';
import { focusSearchBox, errorSignIn } from '../events/AppActions';

class SearchBox extends Component {
	static getStores() {
		return [AppStore];
	}

	static calculateState(/*prevState*/) {
		return {
			focusSearchBox: AppStore.getState()['focusSearchBox'],
			isSignIn: AppStore.getState()['isSignIn'],
			currentRoom: AppStore.getState()['currentRoom'],
		};
	}

	state = {
		searchResult: [],
		selectedIndex: -1,
	};

	onFormSubmit = e => {
		e.preventDefault();
		const { selectedIndex, searchResult } = this.state;
		if (selectedIndex >= 0) {
			this.submitSong(searchResult[selectedIndex].originalURL);

			return;
		}

		if (this.searchInput && this.searchInput.value) {
			this.submitSong(this.searchInput.value);
		}
	};

	onSearchResultClick = e => {
		const songUrl = e.currentTarget.dataset.href;
		if (songUrl) {
			this.submitSong(songUrl);
		}
	};

	keyUpSearchSong = e => {
		const { selectedIndex, searchResult, currentRoom } = this.state;
		switch (e.keyCode) {
			case 38:
				this.setState({ selectedIndex: Math.max(selectedIndex - 1, 0) });
				break;
			case 40:
				this.setState({ selectedIndex: Math.min(selectedIndex + 1, searchResult.length - 1) });
				break;
			case 27:
				this.setState({ searchResult: [], selectedIndex: -1 });
				break;
			default:
				if (e.keyCode !== 13 && currentRoom) {
					Meteor.call('searchSong', this.searchInput.value, currentRoom._id, (err, result) => {
						if (err) {
							console.log(err);
						} else {
							this.setState({ searchResult: result, selectedIndex: -1 });
						}
					});
				}
				break;
		}
	};

	submitSong = songUrl => {
		const userId = Meteor.userId();
		const { currentRoom } = this.state;

		if (!userId) {
			errorSignIn();

			return;
		}

		if (!currentRoom) {
			return;
		}

		Meteor.call('getSongInfo', songUrl, userId, currentRoom._id, (error /*, result*/) => {
			if (error) {
				alert(`Cannot add the song at:\n${songUrl}\nReason: ${error.reason}`);
			}
		});

		// clear input field after inserting has done
		this.searchInput.value = '';
		this.setState({ searchResult: [], selectedIndex: -1 });
	};

	focusSearchBox = () => {
		focusSearchBox(true);
	};

	blurSearchBox = () => {
		focusSearchBox(false);
	};

	refSearchInput = ref => {
		this.searchInput = ref;
	};

	render() {
		const { selectedIndex } = this.state;

		return (
			<li className="col col--7 navbar__item navbar__item--input">
				<form
					onSubmit={this.onFormSubmit}
					className={`search-box ${this.state.focusSearchBox ? 'search-box--focus' : ''} ${
						this.state.searchResult ? 'search-box--active' : ''
					}`}
				>
					<div className="search-box__wrap">
						<div className="search-box__input">
							<input
								type="text"
								className="search-box__input"
								placeholder="Search old song or add new NCT, Zing, YouTube, SoundClound URL"
								onKeyUp={this.keyUpSearchSong}
								onFocus={this.focusSearchBox}
								onBlur={this.blurSearchBox}
								ref={this.refSearchInput}
							/>
						</div>
						<button type="submit" className="search-box__submit" />
					</div>
					{this.state.searchResult && this.state.searchResult.length ? (
						<div className="search-box__result-wrapper">
							<ul className="song-result__list">
								{this.state.searchResult.map((song, index) => (
									<li
										key={song._id}
										className={`song-result__item ${selectedIndex === index ? 'song-result__item--selected' : null}`}
										onClick={this.onSearchResultClick}
										data-href={song.originalURL}
									>
										{song.name} • {song.artist} • {song.origin}
									</li>
								))}
							</ul>
						</div>
					) : null}
				</form>
			</li>
		);
	}
}

export default Container.create(SearchBox);
