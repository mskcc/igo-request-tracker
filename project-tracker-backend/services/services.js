const axios = require("axios");
const https = require("https");
const { LIMS_API, LIMS } = require("./config.js");
const { logger } = require("../helpers/winston");

const formatAllProjectsResponse = function(resp) {
	const data = resp.data || [];
	const requestIds = data.map((entry)=> entry.requestId);

	// LIMS '/getRecentDeliveries' endpoint handles errors by returning an error
	const validIds = requestIds.filter((id) => !id.startsWith("ERROR:"));
	const errors = requestIds.filter((id) => id.startsWith("ERROR:"));
	if(errors.length > 0){
		const allErrors = Array.from(new Set(errors));
		const errMessage = `Failed to retrieve projects. Errors: ${allErrors}`;
		logger.error(errMessage);
		throw new Error(errMessage);
	}
	return {
		requests: validIds
	};
};

const formatData = function(resp) {
	const data = resp.data || [];
	return data;
};

// LIMS is authorized. Avoids certificate verification & "unable to verify the first certificate in nodejs" errors
const agent = new https.Agent({
	rejectUnauthorized: false
});

// TODO - Actually get all projects
exports.getAllProjects = () => {
	const url = `${LIMS_API}/getRecentDeliveries`;
	// return axios.get(`${LIMS_API}/getRecentDeliveries?time=2&units=d`,
	return axios.get(url,
		{auth: { username: LIMS.username, password: LIMS.password},
			httpsAgent: agent})
		.then((resp) => {
			logger.log("info", `Successfully retrieved /getAllProjects response from ${url}`);
			return resp;
		})
		.then(formatAllProjectsResponse);
};

exports.getProjectTrackingInfo = (requestId) => {
	const url = `${LIMS_API}/getRequestTracking?request=${requestId}`;
	logger.log("info", `Sending request to ${url}`);
	return axios.get(url,
		{auth: { username: LIMS.username, password: LIMS.password},
			httpsAgent: agent})
		.then((resp) => {
			logger.log("info", `Successfully retrieved /getProjectTrackingInfo response from ${url}`);
			return resp;
		})
		.then(formatData);
}

