import axios from 'axios';
import {PROJECTS_ENDPOINT, LOGIN_PAGE_URL, HOME_PAGE_PATH} from "../config";
import {getResponseData} from "../utils/utils";


/**
 * Checks whether the authorization status
 * @param error
 */
const checkForAuthorizationError = (error) => {
    const resp = error.response || {};
    const status = resp.status;
    if(status === 401){
        // Automatically redirect client to the login page
        window.location.href = `${LOGIN_PAGE_URL}/${HOME_PAGE_PATH}`;
    }
};

export function getUndeliveredProjectsRequest(projects) {
    /**
     RESP
     "data": {
            "requests": [
                {
                    "samples": [],
                    "requestId": "05427_I",
                    "requestType": "ddPCR",
                    "investigator": "Parisa Momtaz",
                    "pi": "Paul Chapman",
                    "analysisRequested": false,
                    "recordId": 0,
                    "sampleNumber": 68,
                    "restStatus": "SUCCESS",
                    "deliveryDate": [],
                    "autorunnable": false
                },
                ...
            ]
    }
     */
    return axios
        .get(`${PROJECTS_ENDPOINT}/undelivered`)
        .then(resp => {
            const data = getResponseData(resp);
            return data;
        })
        .catch(error => {
            checkForAuthorizationError(error);
            throw new Error('Unable to get Get Events: ' + error)
        });
}

export function getDeliveredProjectsRequest(projects) {
    /*
    return new Promise((resolve) => { resolve(API_PROJECT) })
        .then(resp => {return getData(resp)})
        .catch(error => {throw new Error('Unable to get Get Events: ' + error) });
     */
    /**
     Resp:
         data: {
             reqeusts: [
                 {
                    "samples": [],
                    "requestId": "08822",
                    "requestType": "DNAExtraction",
                    "investigator": "Nancy Bouvier",
                    "pi": "Neerav Shukla",
                    "projectManager": "NO PM",
                    "analysisRequested": true,
                    "recordId": 0,
                    "sampleNumber": 1,
                    "restStatus": "SUCCESS",
                    "autorunnable": false,
                    "deliveryDate": [
                        1592599085454
                    ]
                },
                ...
             ]
             }
         }
     */
    return axios
        .get(`${PROJECTS_ENDPOINT}/delivered`)
        .then(resp => {return getResponseData(resp)})
        .catch(error => {
            checkForAuthorizationError(error);
            throw new Error('Unable to get Get Events: ' + error)
        });
}

export function getProjectTrackingDataRequest(project){
    /*
    return new Promise((resolve) => { resolve(API_PROJECT_ID) })
        .then(resp => { return getData(resp) })
        .catch(error => {throw new Error('Unable to fetch Seq Analysis Projects: ' + error) });
     */
    return axios
        .get(`${PROJECTS_ENDPOINT}/${project}`)
        .then(resp => {return getResponseData(resp) })
        .catch(error => {
            checkForAuthorizationError(error);
            throw new Error('Unable to get Get Events: ' + error)
        });
}
