/**
 * Updates the state of projects in the application
 *
 * @param resp, { [PROJECT_KEY]: {...}, ... }
 */
import {SET_DELIVERED, SET_UNDELIVERED} from "./actionTypes";

export const updateDelivered = (dispatch, payload) => {
    dispatch({
        type: SET_DELIVERED,
        payload
    });
};

export const updateUndelivered = (dispatch, payload) => {
    dispatch({
        type: SET_UNDELIVERED,
        payload
    });
};
