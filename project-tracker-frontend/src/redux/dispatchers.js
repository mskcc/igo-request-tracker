/**
 * Updates the state of projects in the application
 *
 * @param resp, { [PROJECT_KEY]: {...}, ... }
 */
import {SET_PROJECTS} from "./actionTypes";

export const updateProjects = (dispatch, payload) => {
    dispatch({
        type: SET_PROJECTS,
        payload
    });
};
