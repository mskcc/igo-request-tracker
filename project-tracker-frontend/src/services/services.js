import axios from 'axios';
import {PROJECTS_ENDPOINT, LOGIN_PAGE_URL, HOME_PAGE_PATH, HOST} from "../config";
import {getResponseData} from "../utils/utils";

export function getUserSession() {
    return axios
        .get(`${HOST}/login/api/session/user`)
        .then(resp => {
            const data = getResponseData(resp);
            return data;
        })
        .catch(error => {
            checkForAuthorizationError(error);
            return {};
        });
}

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

export function getUndeliveredProjectsRequest(userView) {
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
    let baseUrl = `${PROJECTS_ENDPOINT}/undelivered?days=365`;
    if(userView){
        baseUrl = `${baseUrl}&userView=true`;
    }
    return axios
        .get(baseUrl)
        .then(resp => {
            const data = getResponseData(resp);
            return data;
        })
        .catch(error => {
            checkForAuthorizationError(error);
            throw new Error('Unable to get Get Events: ' + error)
        });
}

export function getDeliveredProjectsRequest(userView) {
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
    let baseUrl = `${PROJECTS_ENDPOINT}/delivered?days=365`;
    if(userView){
        baseUrl = `${baseUrl}&userView=true`;
    }
    return axios
        .get(baseUrl)
        .then(resp => {return getResponseData(resp)})
        .catch(error => {
            checkForAuthorizationError(error);
            throw new Error('Unable to get Get Events: ' + error)
        });
}

export function getProjectTrackingDataRequest(requestId){
    /*
    return new Promise((resolve) => { resolve(API_PROJECT_ID) })
        .then(resp => { return getData(resp) })
        .catch(error => {throw new Error('Unable to fetch Seq Analysis Projects: ' + error) });
     */
    return axios
        /**
         * requestId: IGO RequestID
         * tree: Flag to include the tree view
         */
        .get(`${PROJECTS_ENDPOINT}/${requestId}?tree=true`)
        .then(resp => {return getResponseData(resp) })
        .catch(error => {
            checkForAuthorizationError(error);
            throw new Error('Unable to get Get Events: ' + error)
        });
}
