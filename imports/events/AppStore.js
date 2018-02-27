/* © 2017 Goalify
 * @author Thanh
 */
import { Meteor } from 'meteor/meteor';
import { ReduceStore } from 'flux/utils';

import { Songs, AppStates, Rooms, Messages } from '../collections';
import AppDispatcher from './AppDispatcher';
import * as AppActions from './AppActions';

if (Meteor.isClient) {
	Meteor.subscribe('Songs.public');
	Meteor.subscribe('AppStates.public');
	Meteor.subscribe('Rooms.public');
	Meteor.subscribe('Messages.public');
	window.Songs = Songs;
	window.AppStates = AppStates;
	window.Rooms = Rooms;
	window.Messages = Messages;
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
			revealedSongs: [],
			currentRoom: null,
			toasterOpen: false,
			toasterText: '',
			toasterType: 'success',
			toggleSearchInput: false,
			isChatboxOpen: false,
		};
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
					songLyric: song.lyric,
				};
			}
		}

		return {
			songName: '',
			songLyric: '',
		};
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
			case AppActions.SELECT_SONG:
				reducedState = { selectedSong: this.selectSong(action.id), activeBtnPlay: true };
				break;
			case AppActions.OPEN_POP_UP:
				reducedState = { openPopup: true };
				break;
			case AppActions.CLOSE_POP_UP:
				reducedState = { openPopup: false };
				break;
			case AppActions.UPDATE_LYRIC_POPUP:
				reducedState = this.getSongNameAndLyric(action.id);
				break;
			case AppActions.SET_ROOM:
				reducedState = { currentRoom: action.room };
				break;
			case AppActions.SET_TOASTER:
				reducedState = {
					toasterOpen: action.open,
					toasterText: action.text ? action.text : state.toasterText,
					toasterType: action.toasterType ? action.toasterType : state.toasterType,
				};
				break;
			case AppActions.TOGGLE_SEARCH:
				reducedState = {
					toggleSearchInput: !state.toggleSearchInput,
				};
				break;
			case AppActions.TOGGLE_CHATBOX:
				reducedState = {
					isChatboxOpen: !state.isChatboxOpen,
				};
				break;
			default:
			// console.log(action.type, 'does nothing');
		}

		// return a new object, to immitate pure function
		return Object.assign({}, state, reducedState);
	}
}

// This will create a singleton AppStore and register events trigger from AppDispatcher
const instance = new AppStore(AppDispatcher);

export default instance;
