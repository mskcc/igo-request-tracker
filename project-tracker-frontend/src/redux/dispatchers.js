/**
 * Updates the state of projects in the application
 *
 * @param resp, { [PROJECT_KEY]: {...}, ... }
 */
import { SET_DELIVERED, SET_UNDELIVERED, SET_MODAL_UPDATER } from './actionTypes';

export const updateModalUpdater = (dispatch, payload) => {
    dispatch({
        type: SET_MODAL_UPDATER,
        payload,
    });
};

export const updateDelivered = (dispatch, payload) => {
    dispatch({
        type: SET_DELIVERED,
        payload,
    });
};

export const updateUndelivered = (dispatch, payload) => {
    dispatch({
        type: SET_UNDELIVERED,
        payload,
    });
};
