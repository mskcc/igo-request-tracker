import { combineReducers } from "redux";
import {deliveredRequests, modalUpdater, undeliveredRequests, userSession} from "./projects";

export const STATE_DELIVERED_REQUESTS = 'deliveredRequests';
export const STATE_PENDING_REQUESTS = 'pendingRequests';
export const STATE_MODAL_UPDATER = 'modalUpdater';
export const STATE_USER_SESSION = 'userSession';

export default combineReducers({
    [STATE_DELIVERED_REQUESTS]: deliveredRequests,
    [STATE_PENDING_REQUESTS]: undeliveredRequests,
    [STATE_MODAL_UPDATER]: modalUpdater,
    [STATE_USER_SESSION]: userSession
});
