import { combineReducers } from "redux";
import {deliveredProjects, undeliveredProjects} from "./projects";

export const STATE_DELIVERED_PROJECTS = 'deliveredProjects';
export const STATE_UNDELIVERED_PROJECTS = 'undeliveredProjects';

export default combineReducers({
    [STATE_DELIVERED_PROJECTS]: deliveredProjects,
    [STATE_UNDELIVERED_PROJECTS]: undeliveredProjects
});
