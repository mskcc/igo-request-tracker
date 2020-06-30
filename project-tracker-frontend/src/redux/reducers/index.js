import { combineReducers } from "redux";
import {deliveredProjects, modalUpdater, undeliveredProjects} from "./projects";

export const STATE_DELIVERED_PROJECTS = 'deliveredProjects';
export const STATE_UNDELIVERED_PROJECTS = 'undeliveredProjects';
export const STATE_MODAL_UPDATER = 'modalUpdater';

export default combineReducers({
    [STATE_DELIVERED_PROJECTS]: deliveredProjects,
    [STATE_UNDELIVERED_PROJECTS]: undeliveredProjects,
    [STATE_MODAL_UPDATER]: modalUpdater
});
