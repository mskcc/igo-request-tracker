/**
 * Util for standardizing access of API request objects (e.g. methods/constants)
 */

// TODO - Add all used constants
export const COOKIE_isUser = 'isUser';

export const REQ_requstId = 'requestId';
export const REQ_recipe = 'requestType';
export const REQ_receivedDate = 'receivedDate';
export const REQ_deliveryDate = 'igoCompleteDate';
export const REQ_dueDate = 'dueDate';

export const USER_VIEW = 'isUser';

/**
 * Retrieves the requestId from the API response
 * @param request
 * @returns {string|string|string}
 */
export const getRequestId = (request) => {
    const reqId = request[REQ_requstId];
    if (!reqId) {
        console.error(`Could not retrieve requestId: ${JSON.stringify(request)}`);
        return '';
    }
    return reqId;
};

/**
 * Retrieves the recipe from the API response
 * @param request
 * @returns {string|*}
 */
export const getRecipe = (request) => {
    const recipe = request[REQ_recipe];
    if (!recipe) {
        // console.log('Could not retrieve requestId');
        return '';
    }
    return recipe;
};

/**
 * Retrieves the recipe from the API response
 * @param request
 * @returns {string|*}
 */
export const getIgoCompleteDate = (request) => {
    const igoCompleteDate = request['igoCompleteDate'];
    if (!igoCompleteDate) {
        // console.log('Could not retrieve igoCompleteDate');
        return '';
    }
    return igoCompleteDate;
};

export const getReceivedDate = (request) => {
    const receivedDate = request['receivedDate'];
    if (!receivedDate) {
        // console.log('Could not retrieve receivedDate');
        return '';
    }
    return receivedDate;
};

export const getIsIgoComplete = (request) => {
    const isIgoComplete = request['isIgoComplete'];
    if (undefined === isIgoComplete || null === isIgoComplete) {
        console.error(`Could not retrieve isIgoComplete. Request: ${JSON.stringify(request)}`);
        return false;
    }
    return ('true' === String(isIgoComplete).toLowerCase());
};

export const getDueDate = (request) => {
    const dueDate = request['dueDate'];
    if (undefined === dueDate || null === dueDate) {
        // console.error(`Could not retrieve DueDate. Request: ${JSON.stringify(request)}`);
    }
    return dueDate;
};
