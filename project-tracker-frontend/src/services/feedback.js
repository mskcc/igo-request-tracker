import axios from 'axios';
import { FEEDBACK_ENDPOINT } from '../config';
import { getResponseData } from '../utils/utils';

export const submitFeedbackRequest = (body) => {
    return axios.post(`${FEEDBACK_ENDPOINT}/submit`, body).then(getResponseData);
};
