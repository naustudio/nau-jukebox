/* eslint-disable react/no-danger */
import React, { Component } from 'react';
import { Container } from 'flux/utils';
import he from 'he';
import ReactGA from 'react-ga';

import AppStore from '../events/AppStore';
import { focusSearchBox, errorSignIn, setToaster } from '../events/AppActions';

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

	componentDidMount() {
		document.addEventListener('click', this.onDocumentClick);
	}

	componentWillUnmount() {
		document.removeEventListener('click', this.onDocumentClick);
	}

	onDocumentClick = e => {
		const $target = $(e.target);
		if (!$target.closest('.search-box').length) {
			this.blurSearchBox();
		}
	};

	onFormSubmit = e => {
		if (e) {
			e.preventDefault();
		}
		const { selectedIndex, searchResult } = this.state;
		if (selectedIndex >= 0) {
			ReactGA.event({
				category: 'Playlist',
				action: 'Booked an existing song',
			});
			this.submitSong(searchResult[selectedIndex].originalURL);

			return;
		}

		if (this.searchInput && this.searchInput.value) {
			const songurl = this.searchInput.value;
			let origin = '';

			this.submitSong(songurl);
			if (String(songurl).includes('nhaccuatui')) {
				origin = 'NhacCuaTui';
			} else if (String(songurl).includes('mp3.zing')) {
				origin = 'Zing';
			} else if (String(songurl).includes('soundcloud')) {
				origin = 'SoundCloud';
			} else if (String(songurl).includes('youtube')) {
				origin = 'Youtube';
			}
			if (origin) {
				ReactGA.event({
					category: 'Playlist',
					action: 'Booked song with URL',
					label: origin,
				});
			}
		}
	};

	onSearchResultClick = e => {
		const songUrl = e.currentTarget.dataset.href;
		if (songUrl) {
			ReactGA.event({
				category: 'Playlist',
				action: 'Booked an existing song',
			});
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
			case 13:
				this.onFormSubmit();
				break;
			default:
				if (e.keyCode !== 13 && currentRoom) {
					clearTimeout(this.throttleSearch);
					if (!this.searchInput.value) {
						this.setState({ searchResult: [], selectedIndex: -1 });
					} else {
						this.throttleSearch = setTimeout(() => {
							Meteor.call('searchSong', this.searchInput.value, (err, result) => {
								if (err) {
									console.log(err);
								} else {
									if (result.length && result.length > 15) {
										// reduce number of results
										// eslint-disable-next-line no-param-reassign
										result.length = 15;
									}
									this.setState({ searchResult: result, selectedIndex: -1 });
								}
							});
						}, 200);
					}
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
				setToaster(true, `Cannot add the song at:\n${songUrl}\nReason: ${error.reason}`, 'error');
			} else {
				setToaster(true, `Song's added successfully`, 'success');
			}
		});

		// clear input field after inserting has done
		this.searchInput.value = '';
		this.setState({ searchResult: [], selectedIndex: -1 });
	};

	focusSearchBox = () => {
		const { currentRoom } = this.state;
		if (this.searchInput.value) {
			Meteor.call('searchSong', this.searchInput.value, currentRoom._id, (err, result) => {
				if (err) {
					console.log(err);
				} else {
					this.setState({ searchResult: result, selectedIndex: -1 });
				}
			});
		}
		focusSearchBox(true);
	};

	blurSearchBox = () => {
		this.setState({ searchResult: [], selectedIndex: -1 });
		focusSearchBox(false);
	};

	refSearchInput = ref => {
		this.searchInput = ref;
	};

	render() {
		const { selectedIndex } = this.state;

		return (
			<form
				onSubmit={this.onFormSubmit}
				className={`search-box ${this.state.focusSearchBox ? 'search-box--focus' : ''} ${
					this.state.searchResult.length > 0 ? 'search-box--active' : ''
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
									className={`song-result__item ${selectedIndex === index ? 'song-result__item--selected' : ''}`}
									onClick={this.onSearchResultClick}
									data-href={song.originalURL}
									title="Click to book this song"
								>
									{he.decode(song.name)} • {song.artist} • {song.origin}
								</li>
							))}
						</ul>
					</div>
				) : null}
			</form>
		);
	}
}

export default Container.create(SearchBox);
