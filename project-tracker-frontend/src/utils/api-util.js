/**
 * Util for standardizing access of API request objects (e.g. methods/constants)
 */

// TODO - Add all used constants
export const REQ_requstId = 'requestId';
export const REQ_receivedDate = 'receivedDate';
export const REQ_deliveryDate = "deliveryDate";

/**
 *
 * @param request
 * @returns {string|string|string}
 */
export const getRequestId = (request) => {
    const reqId = request[REQ_requstId];
    if(!reqId){
        console.log("Could not retrieve requestId");
        return "";
    }
    return reqId;
};
