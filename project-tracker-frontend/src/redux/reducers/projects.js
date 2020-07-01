import {SET_DELIVERED, SET_MODAL_UPDATER, SET_UNDELIVERED} from "../actionTypes";

const initialState = {};

export const deliveredProjects = (state = initialState, action) => {
    switch (action.type) {
        case SET_DELIVERED: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
};

export const undeliveredProjects = (state = initialState, action) => {
    switch (action.type) {
        case SET_UNDELIVERED: {
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
