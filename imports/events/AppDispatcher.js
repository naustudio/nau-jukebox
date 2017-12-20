/* © 2017
 * @author Thanh Tran
 */
import { Dispatcher } from 'flux';

/**
 * AppDispatcher to dispatch global app events
 *
 * @example:
 * import AppDispatcher from '../events/AppDispatcher';
 *
 * AppDispatcher.dispatch({type: 'actionType', payload: 'text'});
 */
const AppDispatcher = new Dispatcher();

/**
 * Shortcut for the dispatch method
 *
 * @example:
 * import { dispatch } from '../events/AppDispatcher';
 *
 * dispatch({type: 'actionType', payload: 'text'});
 *
 */
const dispatch = AppDispatcher.dispatch.bind(AppDispatcher);

export {
	AppDispatcher as default,
	dispatch,
};

