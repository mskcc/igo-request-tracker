import {STATE_DELIVERED_PROJECTS, STATE_UNDELIVERED_PROJECTS} from "../redux/reducers";

export function convertUnixTimeToDate(UNIX_Timestamp) {
    const date = new Date(UNIX_Timestamp);
    return date.toLocaleString();
}

export function getHumanReadable(name) {
    const mapping = {
        [STATE_DELIVERED_PROJECTS]: "Delivered Projects",
        [STATE_UNDELIVERED_PROJECTS]: "Undelivered Projects"
    };
    return mapping[name] || name;
}

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
