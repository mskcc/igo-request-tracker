/**
 * Util for standardizing access of API request objects (e.g. methods/constants)
 */

// TODO - Add all used constants
export const REQ_requstId = 'requestId';
export const REQ_recipe = 'requestType';
export const REQ_receivedDate = 'receivedDate';
export const REQ_deliveryDate = "deliveryDate";

/**
 * Retrieves the requestId from the API response
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

/**
 * Retrieves the recipe from the API response
 * @param request
 * @returns {string|*}
 */
export const getRecipe = (request) => {
    const recipe = request[REQ_recipe];
    if(!recipe){
        console.log("Could not retrieve requestId");
        return "";
    }
    return recipe;
}
