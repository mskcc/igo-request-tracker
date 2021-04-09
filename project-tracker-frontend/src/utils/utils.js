import { STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS } from "../redux/reducers";
import React from "react";
import XLSX from "xlsx";
import FileSaver from "file-saver";
import {getIgoCompleteDate, getReceivedDate, getRequestId, getRecipe, getIsIgoComplete, getDueDate} from "./api-util";
import Project from './Project';
import {DF_ALL} from "../components/common/project-filters";
import {getProjectTrackingDataRequest} from "../services/services";
import {updateDelivered, updateUndelivered} from "../redux/dispatchers";

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

export function convertUnixTimeToDateStringFull(UNIX_Timestamp) {
    const date = new Date(UNIX_Timestamp);
    if(isValidDate(date)){
        return date.toLocaleString();
    }
    return '...';
}

export function convertUnixTimeToDateString_Day(UNIX_Timestamp) {
    const date = new Date(UNIX_Timestamp);
    if(isValidDate(date)){
        return date.toLocaleDateString();
    }
    return '...';
};

/**
 * Returns file name suffix to add to the end of a downloaded file
 *      e.g. 08822_IJ-05-Aug-2020
 * @returns {string}
 */
export function getDateFileSuffix(){
    const d = new Date();
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    return `${da}-${mo}-${ye}`;
}

/**
 * Extracts value of a field from an object. Returns null if not present
 * @param obj
 * @param field
 * @returns {int|null}
 */
const extractNumber = function(obj, field){
    if (field in obj) {
        const val = obj[field];
        if(val !== null && !isNaN(val) && val !== 0){
            return val.toFixed(2);
        }
    }
    return null;
};

/**
 * Returns quantity information about the material
 *
 * @param materialInfo - object containing concentration fields (e.g. concentration, volume, mass)
 * @param addUnits - Output values w/ default units - ng/μL
 * @returns {[int, int, int]}
 */
export function getMaterialInfo(materialInfo, addUnits = true) {
    const concentrationUnits = materialInfo['concentrationUnits'] || '';
    let concentration = extractNumber(materialInfo, 'concentration'); // materialInfo['concentration'];
    let volume = extractNumber(materialInfo, 'volume'); // materialInfo['volume'];
    let mass = extractNumber(materialInfo, 'mass');  //  materialInfo['mass'];

    if(mass && addUnits){
        mass = `${mass} ng`;
    }
    if(volume && addUnits){
        volume = `${volume} μL`;
    }
    if(concentration && addUnits){
        concentration = `${concentration} ${concentrationUnits}`;
    }

    return [concentration, volume, mass];
};

/**
 * Comparator of sample objects based on value of their "recordName"
 *  e.g.
 *      INPUT: [ 08470_E_42, 08470_E_11, 08470_E_4, 08470_E_1 ]
 *      OUTPUT: [ 08470_E_1, 08470_E_4, 08470_E_11, 08470_E_42 ]
 *
 * @param s1, eg. { ..., "recordName": "08470_E_42", ... }
 * @param s2, eg. { ..., "recordName": "08470_E_1", ... }
 * @returns -1, 0, 1
 */
export function sortSamples(s1, s2) {
    let s1Root = s1.root || {};
    let s1Name = s1Root['recordName'] || '';
    s1Name = s1Name.toUpperCase();

    let s2Root = s2.root || {};
    let s2Name = s2Root['recordName'] || '';
    s2Name = s2Name.toUpperCase();

    if(s2Name === '' && s1Name === ''){
        return 0;
    } else if(s1Name === ''){
        return 1;
    } else if(s2Name === ''){
        return -1;
    }

    if (s1Name.length - s2Name.length !== 0) {
        return s1Name.length - s2Name.length;
    }

    return (s1Name < s2Name) ? -1 : (s1Name > s2Name) ? 1 : 0;
}

/**
 * Returns the Date element w/ a year, month, day offset
 * @param year
 * @param month
 * @param day
 * @returns {Date}
 */
export function getDateFromNow(year = 0, month = 0, day = 0){
    const date = new Date();

    const newYear = date.getFullYear() + year;
    const newMonth = date.getMonth() + month;
    const newDay = date.getDate() + day;

    date.setFullYear(newYear);
    date.setMonth(newMonth);
    date.setDate(newDay);

    return date;
}

export function getHumanReadable(name) {
    const mapping = {
        [STATE_DELIVERED_REQUESTS]: "Delivered Requests",
        [STATE_PENDING_REQUESTS]: "Pending Requests"
    };
    return mapping[name] || name;
}

export const goToTeamWorks = () => {
    window.open(
        'https://mskcc.teamwork.com/#/projects/488973/tasks/board',
        '_blank' // <- This is what makes it open in a new window.
    );
};

/**
 * Prases out the axios data fields & expected "data" field of the node service response
 * @param resp
 * @returns {*|{}}
 */
export const getResponseData = (resp) => {
    const content = resp.data || {};
    const data = content.data || {};
    return data;
};

/**
 * Returns the value of an event on an Input element
 * @param evt
 * @returns {*}
 */
export const getTargetValue = (evt) => {
    return evt.target.value;
};

/**
 * Downloads data to excel format
 *
 * @param data
 * @param fileName
 */
export const downloadExcel = (data, fileName, header) => {
    const xlsxData = Object.assign([], data);
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    let ws = XLSX.utils.json_to_sheet(xlsxData, {header});

    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array"
    });
    const blob = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(blob, fileName + fileExtension);
};

/**
 * Performs sorting of the request list on @REQ_receivedDate
 * @param requests
 * @returns {*}
 */
export const getSortedRequests = (requests, descending, dateField) => {
    const sortedRequests = requests.sort(function(r1, r2) {
        const d1 = r1[dateField] || -1;
        const d2 = r2[dateField] || -1;

        if(descending) {
            return (d1 > d2) ? -1 : (d1 < d2) ? 1 : 0;
        }
        return (d1 > d2) ? 1 : (d1 < d2) ? -1 : 0;
    });
    return sortedRequests;
};

/**
 * Returns the state object for delivered/pending requests
 *
 * @param requests
 */
export const getRequestState = (requests) => {
    const requestState = {};
    for (const req of requests) {
        // TODO - api
        const requestId = getRequestId(req);
        const recipe = getRecipe(req);
        const receivedDate = getReceivedDate(req);
        const igoCompleteDate = getIgoCompleteDate(req);
        const dueDate = getDueDate(req);
        const isIgoComplete = getIsIgoComplete(req);
        if(requestId && requestId !== ""){
            // Initialize an entry for the project - will be enriched later by Project::enrichRequest
            requestState[requestId] = new Project(requestId, igoCompleteDate, receivedDate, dueDate, recipe, isIgoComplete);
        }
    }
    return requestState;
}

/**
 * Returns a list of requests that have been filtered on the date field specified in props
 *
 * @param requestList
 * @returns {[]}
 */
const getDateFilteredList = (requestList, dateFilter, dateFilterField) => {
    const numDays = parseInt(dateFilter);
    const oldestDate = getDateFromNow(0, 0, -numDays);
    const dateFilteredList = [];
    for(const req of requestList){
        const receivedDate = req[dateFilterField];
        if(receivedDate && receivedDate > oldestDate){
            // receivedDate needs to be present and that usually means it is new
            dateFilteredList.push(req);
        } else if (!receivedDate && DF_ALL === dateFilter){
            // Only add request w/ missing received date if filtering for all projects
            dateFilteredList.push(req);
        }
    }
    return dateFilteredList;
};

/**
 * Returning the first 5 results that get returned from the filter
 *
 * @param mapping
 * @returns {string[]}
 */
const getFilteredProjectsFromQuery = (requests, requestIdQuery) => {
    const filtered = requests.filter((req) => {
        const requestId = getRequestId(req);
        return requestId.startsWith(requestIdQuery);
    });
    return filtered;
};

/**
 * Filters requests by the state value for filteredRequests
 * @param requests
 * @returns {*}
 */
const getFilteredProjectsFromRecipe = (requests, filteredRecipes) => {
    // If no filter is applied, return all the requests
    if(filteredRecipes.size === 0){
        return requests;
    }
    const filtered = requests.filter((req) => {
        const recipe = getRecipe(req);
        return filteredRecipes.has(recipe);
    });
    return filtered;
};

/**
 * Performs the filtering on an input list of requests
 *
 * @param requestList
 * @param filteredRecipes
 * @param requestIdQuery
 * @param dateFilter
 * @param dateFilterField
 * @param descendingDateSort
 * @returns {*}
 */
export const filterRequestList = function(requestList, filteredRecipes, requestIdQuery, dateFilter, dateFilterField) {
    const dateFilteredList = getDateFilteredList(requestList, dateFilter, dateFilterField);
    const requestIdFilteredList = getFilteredProjectsFromQuery(dateFilteredList, requestIdQuery);
    const recipeFilteredList = getFilteredProjectsFromRecipe(requestIdFilteredList, filteredRecipes);

    return recipeFilteredList;
};

/**
 * Updates the redux store with tracking information about a request
 * @param projectName
 * @param projectState
 * @param redux_store
 * @param redux_dispatch
 * @returns {*}
 */
export const getRequestTrackingInfoForRequest = (requestId, projectState, redux_store, redux_dispatch) => {
    // Need to request the tracking information of the project
    return getProjectTrackingDataRequest(requestId)
        .then(data => {
            const storeProjects = redux_store.getState()[projectState] || {};  // Retrieve latest version of the store
            const clone = Object.assign({}, storeProjects);

            const request = clone[requestId];
            request.addRequestTrackingInfo(data);

            if(STATE_DELIVERED_REQUESTS === projectState){
                updateDelivered(redux_dispatch, clone);
            } else if(STATE_PENDING_REQUESTS === projectState) {
                updateUndelivered(redux_dispatch, clone);
            }
        })
};

export const XLSX_SAMPLE_NAME = 'Sample Name';
export const XLSX_IGO_ID = 'IGO ID';
export const XLSX_INVESTIGATOR_ID = 'Investigator ID';
export const XLSX_CORRECTED_INVESTIGATOR_ID = 'Corrected Investigator ID';
export const XLSX_STATUS = 'Status';
export const XLSX_NA_CONCENTRATION = 'DNA/RNA Concentration (ng/µL)';
export const XLSX_NA_VOLUME = 'DNA/RNA Volume (µL)';
export const XLSX_NA_MASS = 'DNA/RNA Mass (ng)';
export const XLSX_LIB_CONCENTRATION = 'Library Concentration (ng/µL)';
export const XLSX_LIB_VOLUME = 'Library Volume (µL)';
export const XLSX_LIB_MASS = 'Library Mass (ng)';

export const XLSX_HEADERS = [
    XLSX_SAMPLE_NAME,
    XLSX_IGO_ID,
    XLSX_INVESTIGATOR_ID,
    XLSX_CORRECTED_INVESTIGATOR_ID,
    XLSX_STATUS,
    XLSX_NA_CONCENTRATION,
    XLSX_NA_VOLUME,
    XLSX_NA_MASS,
    XLSX_LIB_CONCENTRATION,
    XLSX_LIB_VOLUME,
    XLSX_LIB_MASS
];

/**
 * Extracts all sample info for an input list of samples
 * @param samples
 * @returns {[]}
 */
export const extractQuantifyInfoXlsx = function(samples) {
    samples.sort(sortSamples);
    const sampleInfoList = [];
    for(const sample of samples){
        const root = sample['root'] || {};
        const igoId = root['recordName'];
        const status = sample['status'];
        const sampleInfo = sample['sampleInfo'] || {};
        const sampleName = sampleInfo['sampleName'] || '';
        const investigatorId = sampleInfo['investigatorId'] || '';
        const correctedInvestigatorId = sampleInfo['correctedInvestigatorId'] || '';
        const dnaInfo = sampleInfo['dna_material'] || {};
        const libraryInfo = sampleInfo['library_material'] || {};
        const [dnaConcentration, dnaVolume, dnaMass] = getMaterialInfo(dnaInfo, false);
        const [libraryConcentration, libraryVolume, libraryMass] = getMaterialInfo(libraryInfo, false);

        // MAKE SURE YOU UPDATE THE HEADERS
        const xlsxObj = {
            [XLSX_SAMPLE_NAME]: sampleName,
            [XLSX_IGO_ID]: igoId,
            [XLSX_INVESTIGATOR_ID]: investigatorId,
            [XLSX_CORRECTED_INVESTIGATOR_ID]: correctedInvestigatorId,
            [XLSX_STATUS]: status,
            [XLSX_NA_CONCENTRATION]: dnaConcentration || 0,
            [XLSX_NA_VOLUME]: dnaVolume || 0,
            [XLSX_NA_MASS]: dnaMass || 0,
            [XLSX_LIB_CONCENTRATION]: libraryConcentration || 0,
            [XLSX_LIB_VOLUME]: libraryVolume || 0,
            [XLSX_LIB_MASS]: libraryMass || 0
        };
        sampleInfoList.push(xlsxObj);
    }

    return sampleInfoList;
};
