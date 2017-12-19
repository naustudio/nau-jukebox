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
class UserStore extends ReduceStore {
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
			listUser: [{ id: 1, toggleUser: false }, { id: 2, toggleUser: true }],
			isSignIn: false,
			errorSignIn: false,
			userName: 'Sign in',
			activeHost: false,
		};
	}

	signInUser(info) {
		return ({ isSignIn: true, errorSignIn: false, userName: 'lepham' });
	}

	activeHost(hostId) {
		if (hostId === 110114) {

			return true;
		}

		return false;
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
			case AppActions.SIGN_IN_USER:
				reducedState = {
					isSignIn: this.signInUser(action.info).isSignIn,
					userName: this.signInUser(action.info).userName,
					errorSignIn: this.signInUser(action.info).errorSignIn,
				};
				break;
			case AppActions.ERROR_SIGN_IN:
				reducedState = {
					errorSignIn: true,
				};
				break;
			case AppActions.ACTIVE_HOST:
				if (!state.isSignIn) {
					reducedState = {
						errorSignIn: true,
					};
				} else {
					reducedState = {
						activeHost: this.activeHost(action.hostId),
					};
				}
				break;
			default:
				console.log(action.type, 'does nothing');
		}

		// return a new object, to immitate pure function
		return Object.assign({}, state, reducedState);
	}

}

// This will create a singleton AppStore and register events trigger from AppDispatcher
const instance = new UserStore(AppDispatcher);

export default instance;
