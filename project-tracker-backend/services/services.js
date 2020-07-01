const axios = require("axios");
const https = require("https");
const { LIMS_API, LIMS } = require("./config.js");
const { logger } = require("../helpers/winston");

const formatAllProjectsResponse = function(resp) {
	// TODO - should add a filter for whoever is logged in
	// TODO - Should also return a more enirched object for each sample
	const data = resp.data || [];

	// LIMS '/getRecentDeliveries' endpoint handles errors by returning populating the requestId field w/ an "ERROR:"
	const validProjects = data.filter((entry) => !entry.requestId.startsWith("ERROR:"));
	const invalidProjects = data.filter((entry) => entry.requestId.startsWith("ERROR:"));
	if(invalidProjects.length > 0){
		const errorIds = invalidProjects.map((entry) => entry.requestId);
		const allErrors = Array.from(new Set(errorIds));
		const errMessage = `Failed to retrieve requests. Errors: ${allErrors}`;
		logger.error(errMessage);
		throw new Error(errMessage);
	}
	return {
		requests: validProjects
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

exports.getUndeliveredProjects = () => {
	const url = `${LIMS_API}/getUndeliveredProjects?time=7`;
	return axios.get(url,
		{auth: { username: LIMS.username, password: LIMS.password}, httpsAgent: agent})
		.then((resp) => {
			logger.log("info", `Successfully retrieved /getUndeliveredProjects response from ${url}`);
			return resp;
		})
		.then((resp) => {
			// TODO - should add a filter for whoever is logged in
			const data = resp.data || [];
			return {
				requests: data
			};
		});
};

// TODO - Actually get all projects
exports.getRecentDeliveries = () => {
	const url = `${LIMS_API}/getRecentDeliveries?time=7&units=d`;
	// return axios.get(`${LIMS_API}/getRecentDeliveries?time=2&units=d`,
	return axios.get(url,
		{auth: { username: LIMS.username, password: LIMS.password}, httpsAgent: agent})
		.then((resp) => {
			logger.log("info", `Successfully retrieved /getRecentDeliveries response from ${url}`);
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
};

