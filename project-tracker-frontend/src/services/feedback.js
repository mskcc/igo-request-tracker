import axios from 'axios';
import {FEEDBACK_ENDPOINT} from "../config";
import {getResponseData} from "../utils/utils";


export const submitFeedbackRequest = (body, subject, type) => {
    const content = { body, subject, type };
    return axios.post(`${FEEDBACK_ENDPOINT}/submitFeedback`, content)
        .then(getResponseData)
};
