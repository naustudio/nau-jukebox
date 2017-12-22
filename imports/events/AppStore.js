/* © 2017 Goalify
 * @author Thanh
 */
import { Meteor } from 'meteor/meteor';
import { ReduceStore } from 'flux/utils';

import { Songs, AppStates } from '../collections';
import AppDispatcher from './AppDispatcher';
import * as AppActions from './AppActions';

if (Meteor.isClient) {
	Meteor.subscribe('Songs.public');
	Meteor.subscribe('AppStates.public');
	window.Songs = Songs;
	window.AppStates = AppStates;
}

/**
 * The Flux ReducedStore to keep the states of the whole app
 *
 * @example
 * // to get the whole state object, avoid mutate the store object
 * AppStore.getState().stateName
 * // to get a root object from the state tree
 * AppStore.getRootState('stateName')
 */
class AppStore extends ReduceStore {
	/**
	 * Get state at the root property
	 * @param  {String} stateName name of root state
	 * @return {any}           State object
	 */
	getRootState(stateName) {
		return this.getState()[stateName];
	}

	// built-in ReduceStore hook
	getInitialState() {
		return {
			tabIndex: 0,
			activeBtnPlay: false,
			focusSearchBox: false,
			toggleBtnNav: false,
			selectedSong: null,
			openPopup: false,
			songName: '',
			songLyric: '',
			revealedSongs: []
		};
	}

	searchSong(searchString) {
		if (searchString.length >= 2) {
			const data = Songs.find(
				{
					searchPattern: { $regex: `${searchString.toLowerCase()}*` }
				},
				{
					limit: 50, // we remove duplicated result and limit further
					reactive: false
				}
			).fetch();

			return data;
		}

		return null;
	}

	selectSong(id) {
		if (id) {
			return Songs.findOne({ _id: id });
		}

		return null;
	}

	getSongNameAndLyric(id) {
		if (id) {
			const song = Songs.findOne({ _id: id });
			if (song) {
				return {
					songName: song.name,
					songLyric: song.lyric
				};
			}
		}

		return {
			songName: '',
			songLyric: ''
		};
	}

	toggleRevealedSongs(id, songList) {
		const newArray = [...songList];
		console.log(songList);
		const songIndex = newArray.indexOf(id);
		if (songIndex > -1) {
			newArray.splice(songIndex, 1);
		} else {
			newArray.push(id);
		}

		return newArray;
	}

	/**
	 * Pure function, avoid mutate inputs
	 * @param  {Object} state  Current state object
	 * @param  {Object} action Action payload object
	 * @return {Object}        new state
	 */
	reduce(state, action) {
		let reducedState;
		switch (action.type) {
			case AppActions.CHANGE_TAB:
				reducedState = { tabIndex: action.tabIndex };
				break;
			case AppActions.ACTIVE_BTN_PLAY:
				reducedState = { activeBtnPlay: true };
				break;
			case AppActions.DEACTIVE_BTN_PLAY:
				reducedState = { activeBtnPlay: false };
				break;
			case AppActions.FOCUS_SEARCH_BOX:
				reducedState = { focusSearchBox: action.isFocus };
				break;
			case AppActions.SEARCH_SONG:
				reducedState = { searchResult: this.searchSong(action.searchString) };
				break;
			case AppActions.SELECT_SONG:
				reducedState = { selectedSong: this.selectSong(action.id) };
				break;
			case AppActions.OPEN_POP_UP:
				reducedState = {
					openPopup: true
				};
				break;
			case AppActions.CLOSE_POP_UP:
				reducedState = {
					openPopup: false
				};
				break;
			case AppActions.UPDATE_LYRIC_POPUP:
				reducedState = this.getSongNameAndLyric(action.id);
				break;
			case AppActions.TOGGLE_USER_BOOK:
				reducedState = {
					revealedSongs: this.toggleRevealedSongs(action.id, state.revealedSongs)
				};
				break;
			default:
				console.log(action.type, 'does nothing');
		}

		// return a new object, to immitate pure function
		return Object.assign({}, state, reducedState);
	}
}

// This will create a singleton AppStore and register events trigger from AppDispatcher
const instance = new AppStore(AppDispatcher);

export default instance;
