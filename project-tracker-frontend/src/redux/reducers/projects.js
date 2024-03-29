import {SET_DELIVERED, SET_MODAL_UPDATER, SET_UNDELIVERED, SET_USER_SESSION} from "../actionTypes";

const initialState = {};

export const deliveredRequests = (state = initialState, action) => {
    switch (action.type) {
        case SET_DELIVERED: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
};

export const undeliveredRequests = (state = initialState, action) => {
    switch (action.type) {
        case SET_UNDELIVERED: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
};

export const userSession = (state = { NOT_INITIALIZED: true }, action) => {
    switch (action.type) {
        case SET_USER_SESSION: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
};

export const modalUpdater = (state = initialState, action) => {
    switch (action.type) {
        case SET_MODAL_UPDATER: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
};
