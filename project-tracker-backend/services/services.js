const axios = require("axios");
const https = require("https");
const { LIMS_API, LIMS } = require("./config.js");
const { logger } = require("../helpers/winston");

// LIMS is authorized. Avoids certificate verification & "unable to verify the first certificate in nodejs" errors
const agent = new https.Agent({
	rejectUnauthorized: false
});
const formatAllProjectsResponse = function(resp) {
	// TODO - should add a filter for whoever is logged in
	// TODO - Should also return a more enirched object for each sample
	const payload = resp.data || {};
	const requests = payload.requests || [];

	requests.map(req => {
		const recentDeliveryDate = req["recentDeliveryDate"];
		const completedDate = req["completedDate"];
		req["igoCompleteDate"] = recentDeliveryDate ? recentDeliveryDate : completedDate;
		return req;
	});

	return { requests };
};

const formatData = function(resp) {
	const data = resp.data || [];
	return data;
};

exports.getUndeliveredProjects = () => {
	const url = `${LIMS_API}/getIgoRequests?days=365&complete=false`;
	return axios.get(url,
		{auth: { username: LIMS.username, password: LIMS.password}, httpsAgent: agent})
		.then((resp) => {
			logger.log("info", `Successfully retrieved /getUndeliveredProjects response from ${url}`);
			return resp;
		})
		.then(formatAllProjectsResponse);
};

// TODO - Actually get all projects
exports.getRecentDeliveries = () => {
	const url = `${LIMS_API}/getIgoRequests?days=365&complete=true`;
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
		.then(formatData)
		.catch((err) => {
		    logger.error(`Error retrieving data for Request: ${requestId}`);
		    return {};
		});
};

