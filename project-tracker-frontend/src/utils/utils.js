import { STATE_DELIVERED_REQUESTS, STATE_PENDING_REQUESTS } from '../redux/reducers';
import TextField from '@material-ui/core/TextField/TextField';
import React from 'react';

export function convertUnixTimeToDate(UNIX_Timestamp) {
    const date = new Date(UNIX_Timestamp);
    return date.toLocaleString();
}

export function getHumanReadable(name) {
    const mapping = {
        [STATE_DELIVERED_REQUESTS]: 'Delivered Requests',
        [STATE_PENDING_REQUESTS]: 'Pending Requests',
    };
    return mapping[name] || name;
}

const getTargetValue = (evt) => {
    return evt.target.value;
};

export const generateTextInput = (label, val, fn, required = false) => {
    return (
        <TextField
            id="standard-basic"
            className={'fill-width'}
            label={label}
            value={val}
            onChange={(evt) => fn(getTargetValue(evt))}
            required={required}
        />
    );
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
