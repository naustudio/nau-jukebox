import React, { Component } from 'react';
import { Container } from 'flux/utils';
import AppStore from '../events/AppStore';
import { focusSearchBox, searchSong } from '../events/AppActions';

class SearchBox extends Component {

	static getStores() {
		return [AppStore];
	}

	static calculateState(prevState) {
		return {
			focusSearchBox: AppStore.getState()['focusSearchBox'],
			isSignIn: AppStore.getState()['isSignIn'],
			searchResult: AppStore.getState()['searchResult'],
		};
	}

	onFormSubmit = (e) => {
		e.preventDefault();
	}

	keyUpSearchSong = (e) => {
		if (e.keyCode === 13) {
			this.submitSong();
			e.preventDefault();
		} else {
			searchSong(this.searchInput.value);
		}
	}

	submitSong = () => {
		if (this.state.isSignIn && this.searchInput && this.searchInput.value) {
			const userId = Meteor.userId();

			if (!userId) {
				// showRequireMessage();
				return;
			}

			Meteor.call('getSongInfo', this.searchInput.value, userId, (error /*, result*/) => {
				if (error) {
					alert(`Cannot add the song at:\n${this.searchInput.value}\nReason: ${error.reason}`);
				}

				// clear input field after inserting has done
				this.searchInput.value = '';
			});
		}
	}

	focusSearchBox = () => {
		focusSearchBox(true);
	}

	blurSearchBox = () => {
		focusSearchBox(false);
	}

	refSearchInput = (ref) => {
		this.searchInput = ref;
	}

	render() {
		return (
			<li className="col col--7 navbar__item navbar__item--input">
				<form onSubmit={this.onFormSubmit} className={`search-box ${this.state.focusSearchBox ? 'search-box--focus' : ''}`}>
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
						<button
							type="submit"
							className="search-box__submit"
							onClick={this.submitSong}
						/>
					</div>
				</form>
				{this.state.searchResult ? (
					<div className="search-box__result-wrapper">
						<ul className="song-result__list">
							{this.state.searchResult.map((song) => (
								<li className="song-result__item js-song-result__item {{_active}}" data-href={song.originalURL}>{song.name} • {song.artist} • {song.origin}</li>
							))}
						</ul>
					</div>
				) : null}
			</li>
		);
	}
}

export default Container.create(SearchBox);
