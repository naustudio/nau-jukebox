/* © 2017
 * @author Thanh
 */
import { dispatch } from './AppDispatcher';

export const CHANGE_TAB = 'CHANGE_TAB';

export const CHANGE_NHAP = 'CHANGE_NHAP';

export const DELETE_SONG = 'DELETE_SONG';

export const TOGGLE_USER_BOOK = 'TOGGLE_USER_BOOK';

export const TOGGLE_BTN_PLAY = 'TOGGLE_BTN_PLAY';

export const ACTIVE_BTN_PLAY = 'ACTIVE_BTN_PLAY';

export const DEACTIVE_BTN_PLAY = 'DEACTIVE_BTN_PLAY';

export const SELECT_SONG = 'SELECT_SONG';

export const ACTIVE_HOST = 'ACTIVE_HOST';

export const FOCUS_SEARCH_BOX = 'FOCUS_SEARCH_BOX';

export const ERROR_SIGN_IN = 'ERROR_SIGN_IN';

export const TOGGLE_BTN_NAV = 'TOGGLE_BTN_NAV';

export const UPDATE_LYRIC_POPUP = 'UPDATE_LYRIC_POPUP';

export const OPEN_POP_UP = 'OPEN_POP_UP';

export const CLOSE_POP_UP = 'CLOSE_POP_UP';

/**
 * @param  {String} tabIndex tab index of the new section
 * @return {void}
 */
export function changeTab(tabIndex) {
	dispatch({ type: CHANGE_TAB, tabIndex });
}

/**
 * @param  {Number} id of song
 * @return {void}
 */
export function deleleSong(id) {
	dispatch({ type: DELETE_SONG, id });
}

/**
 * @param  {Number} id of song
 * @return {void}
 */
export function toggleUserBook(id) {
	dispatch({ type: TOGGLE_USER_BOOK, id });
}

/**
 * @param
 * @return {void}
 */

export function activeBtnPlay() {
	dispatch({ type: ACTIVE_BTN_PLAY });
}

/**
 * @param
 * @return {void}
 */

export function deactiveBtnPlay() {
	dispatch({ type: DEACTIVE_BTN_PLAY });
}

/**
 * @param {Number} id of song
 * @return {void}
 */
export function selectSong(id) {
	dispatch({ type: SELECT_SONG, id });
}

/**
 * @param {Boolean} isActive
 * @return {void}
 */

export function activeHost(isActive) {
	dispatch({ type: ACTIVE_HOST, isActive });
}

/**
 * @param {bool} isFocus of song
 * @return {void}
 */
export function focusSearchBox(isFocus) {
	dispatch({ type: FOCUS_SEARCH_BOX, isFocus });
}

/**
 * @param
 * @return {void}
 */

export function errorSignIn() {
	dispatch({ type: ERROR_SIGN_IN });
}

/**
 * @param
 * @return {void}
 */

export function toggleBtnNav() {
	dispatch({ type: TOGGLE_BTN_NAV });
}

/**
 * @param
 * @return {void}
 */

export function updateLyricPopup(id) {
	dispatch({ type: UPDATE_LYRIC_POPUP, id });
}

/**
 * @param
 * @return {void}
 */

export function openPopUp(id) {
	dispatch({ type: OPEN_POP_UP, id });
}

/**
 * @param
 * @return {void}
 */

export function closePopUp() {
	dispatch({ type: CLOSE_POP_UP });
}
