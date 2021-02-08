const cache = require("../helpers/cache");
const apiResponse = require("../helpers/apiResponse");
const { filterProjectsOnHierarchy, isUser } = require("../helpers/utility");
const { getRecentDeliveries, getUndeliveredProjects, getProjectTrackingInfo } = require("../services/services");
const { authenticateRequest } = require("../middlewares/jwt-cookie");

/**
 * Returns Tracking info for a particular request
 *
 * @param req, express
 * @param res, express
 * @returns {Promise<T>}
 */
const getRequestTrackingInfo = function(req, res) {
	const project = req.params.id;
	if(!project) return apiResponse.ErrorResponse(res, "No project in request");
	const key = `PROJECT_TRACKING_DATA_${project}`;
	const retrievalFunc = () => getProjectTrackingInfo(project);
	return cache.get(key, retrievalFunc)
		.then((projects) => {
			return apiResponse.successResponseWithData(res, "success", projects);
		})
		.catch((err) => {
			return apiResponse.ErrorResponse(res, err.message);
		});
};

/**
 * Returns list of requests delivered by IGO
 *
 * @param req, express
 * @param res, express
 * @returns {Promise<T>}
 */
const getDeliveredRequests = async function (req, res) {
	const query = req.query || {};
	const days = query.days || 30;	// Default to returning requests from past 30 days
	const key = `DELIVERED_REQUESTS___${days}`;

	// Anyone can mock their user view by providing this parameter (only affects non-users)
	const userView = query.userView;
	const showUserView = userView ? (userView.toLowerCase() === "true" ? true : false) : false;

	return cache.get(key, () => getRecentDeliveries(days))
		.then(async (projects) => {
			if (isUser(req) || showUserView) {
				// Users should have their requests filtered (IGO members will not have their projects filtered)
				const all = projects["requests"] || [];
				const filteredRequests = await filterProjectsOnHierarchy(req, all, key);
				projects = { ...projects };		// clone - prevents altering the cached value
				projects["requests"] = filteredRequests;
			}
			return apiResponse.successResponseWithData(res, "success", projects);
		})
		.catch((err) => {
			return apiResponse.ErrorResponse(res, err.message);
		});
};

/**
 * Returns list of requests still pending with IGO
 *
 * @param req, express
 * @param res, express
 * @returns {Promise<T>}
 */
const getPendingRequests = async function (req, res) {
	const query = req.query || {};
	const days = query.days || 30;	// Default to returning requests from past 30 days

	const key = `PENDING_REQUESTS___${days}`;

	// Anyone can mock their user view by providing this parameter (only affects non-users)
	const userView = query.userView;
	const showUserView = userView ? (userView.toLowerCase() === "true" ? true : false) : false;

	return cache.get(key, () => getUndeliveredProjects(days))
		.then(async (projects) => {
			if(isUser(req) || showUserView) {
				const all = projects["requests"] || [];
				const filteredRequests = await filterProjectsOnHierarchy(req, all, key);
				projects = { ...projects };		// clone - prevents altering the cached value
				projects["requests"] = filteredRequests;
			}
			return apiResponse.successResponseWithData(res, "success", projects);
		})
		.catch((err) => {
			return apiResponse.ErrorResponse(res, err.message);
		});
};

/* Application Authentications */
// TODO - there needs to be an option to force an update
exports.getDeliveredProjects = [
	authenticateRequest,
	getDeliveredRequests
];
// TODO - there needs to be an option to force an update
exports.getUndeliveredProjects = [
	authenticateRequest,
	getPendingRequests
];
// TODO - there needs to be an option to force an update
exports.getProjectTrackingData = [
	authenticateRequest,
	getRequestTrackingInfo
];
