import { STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS } from "../redux/reducers";
import React from "react";
import XLSX from "xlsx";
import FileSaver from "file-saver";
import { getIgoCompleteDate, getReceivedDate, getRequestId, getRecipe, getIsIgoComplete } from './api-util';
import Project from './Project';

export function convertUnixTimeToDateStringFull(UNIX_Timestamp) {
    const date = new Date(UNIX_Timestamp);
    return date.toLocaleString();
}

export function convertUnixTimeToDateString_Day(UNIX_Timestamp) {
    const date = new Date(UNIX_Timestamp);
    return date.toLocaleDateString();
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
export const downloadExcel = (data, fileName) => {
    const xlsxData = Object.assign([], data);
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(xlsxData);
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
        const isIgoComplete = getIsIgoComplete(req);
        if(requestId && requestId !== ""){
            // Initialize an entry for the project - will be enriched later by Project::enrichRequest
            requestState[requestId] = new Project(requestId, igoCompleteDate, receivedDate, recipe, isIgoComplete);
        }
    }
    return requestState;
}
