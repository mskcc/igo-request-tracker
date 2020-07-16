import {STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS} from "../redux/reducers";
import TextField from "@material-ui/core/TextField/TextField";
import React from "react";
import XLSX from "xlsx";
import FileSaver from "file-saver";

export function convertUnixTimeToDate(UNIX_Timestamp) {
    const date = new Date(UNIX_Timestamp);
    return date.toLocaleString();
}

export function getHumanReadable(name) {
    const mapping = {
        [STATE_DELIVERED_REQUESTS]: "Delivered Requests",
        [STATE_PENDING_REQUESTS]: "Pending Requests"
    };
    return mapping[name] || name;
}

const getTargetValue = (evt) => {
    return evt.target.value;
};

export const generateTextInput = (label, val, fn, required = false) => {
    return <TextField  id="standard-basic"
                       className={"fill-width"}
                       label={label}
                       value={val}
                       onChange={(evt) => fn(getTargetValue(evt))}
                       required={required}/>;
};

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
 * Downloads data to excel format
 *
 * @param data
 * @param fileName
 */
export const downloadExcel = (data, fileName) => {
    debugger;
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


export const getSortedRequests = (requests) => {
    console.log(requests[0].receivedDate);
    const sortedRequests = requests.sort(function(r1, r2) {
        const d1 = r1['receivedDate'] || -1;
        const d2 = r2['receivedDate'] || -1;

        return (d1 > d2) ? -1 : (d1 < d2) ? 1 : 0;
    });
    console.log(sortedRequests[0].receivedDate);
    return sortedRequests;
};
