import axios from 'axios';
import {PROJECTS_ENDPOINT} from "../config";
import API_PROJECT_ID from '../mocks/api-projects-id';
import API_PROJECT from '../mocks/api-projects';


const getData = (resp) => {
    const content = resp.data || {};
    const data = content.data || {};
    return data;
};

export function getProjects(projects) {
    /*
    return new Promise((resolve) => { resolve(API_PROJECT) })
        .then(resp => {return getData(resp)})
        .catch(error => {throw new Error('Unable to get Get Events: ' + error) });
     */
    return axios
        .get(`${PROJECTS_ENDPOINT}/`)
        .then(resp => {return getData(resp) })
        .catch(error => {throw new Error('Unable to get Get Events: ' + error) });
}

export function getProjectTrackingData(project){
    /*
    return new Promise((resolve) => { resolve(API_PROJECT_ID) })
        .then(resp => { return getData(resp) })
        .catch(error => {throw new Error('Unable to fetch Seq Analysis Projects: ' + error) });
     */
    return axios
        .get(`${PROJECTS_ENDPOINT}/${project}`)
        .then(resp => {return getData(resp) })
        .catch(error => {throw new Error('Unable to get Get Events: ' + error) });
}
