export const getRequestId = (request) => {
    if(!request.requestId){
        console.log("Could not retrieve requestId");
        return "";
    }
    return request.requestId;
};
