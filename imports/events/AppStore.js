/* © 2017 Goalify
 * @author Thanh
 */
import { ReduceStore } from 'flux/utils';
import AppDispatcher from './AppDispatcher';
import * as AppActions from './AppActions';

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
			selectedSong: null
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
				reducedState = {
					tabIndex: action.tabIndex
				};
				break;
			case AppActions.ACTIVE_BTN_PLAY:
				reducedState = {
					activeBtnPlay: true
				};
				break;
			case AppActions.DEACTIVE_BTN_PLAY:
				reducedState = {
					activeBtnPlay: false
				};
				break;
			case AppActions.FOCUS_SEARCH_BOX:
				reducedState = {
					focusSearchBox: action.isFocus
				};
				break;
			case AppActions.SEARCH_SONG:
				reducedState = {
					searchResult: this.searchSong(action.searchString)
				};
				break;
			case AppActions.SELECT_SONG:
				reducedState = {
					selectedSong: this.selectSong(action.id)
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
