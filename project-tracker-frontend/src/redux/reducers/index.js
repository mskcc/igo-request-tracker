import { combineReducers } from "redux";
import {deliveredRequests, modalUpdater, undeliveredRequests} from "./projects";

export const STATE_DELIVERED_REQUESTS = 'deliveredRequests';
export const STATE_PENDING_REQUESTS = 'pendingRequests';
export const STATE_MODAL_UPDATER = 'modalUpdater';

export default combineReducers({
    [STATE_DELIVERED_REQUESTS]: deliveredRequests,
    [STATE_PENDING_REQUESTS]: undeliveredRequests,
    [STATE_MODAL_UPDATER]: modalUpdater
});
