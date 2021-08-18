const cache = require("../helpers/cache");
const apiResponse = require("../helpers/apiResponse");
const { logger } = require("../helpers/winston");
const { filterProjectsOnHierarchy, isUser } = require("../helpers/utility");
const { getRecentDeliveries, getUndeliveredProjects, getProjectTrackingInfo } = require("../services/services");
const { authenticateRequest } = require("../middlewares/jwt-cookie");
const { isInputTrue } = require("../helpers/utility");

/**
 * Standardizes parsing of "days" filter from the request query params
 *
 * @type {number}
 */
const DEFAULT_TIME_FILTER = 30;
const getTimeFilterFromReq = function(query) {
	const days = query.days || DEFAULT_TIME_FILTER;	// Default to returning requests from past X days
	return days;
};

/**
 * Returns Tracking info for a particular request
 *
 * @param req, express
 * @param res, express
 * @returns {Promise<T>}
 */
const getRequestTrackingInfo = function(req, res) {
	const query = req.query || {};
	const requestId = req.params.requestId;
	let includeTree = isInputTrue(query.tree);

	if(!requestId) return apiResponse.ErrorResponse(res, "No requestId provided");
	const key = `PROJECT_TRACKING_DATA_${requestId}`;
	const retrievalFunc = () => getProjectTrackingInfo(requestId);
	return cache.get(key, retrievalFunc)
		.then((requestInfo) => {
			if(!includeTree){
				const noTreeRequest =  Object.assign({}, requestInfo);
				const samples = noTreeRequest.samples || [];
				const treelessSamples = [];
				for(const sample of samples){
					const newSample = Object.assign({}, sample);
					delete newSample.root;
					treelessSamples.push(newSample);
				}
				noTreeRequest.samples = treelessSamples;
				return apiResponse.successResponseWithData(res, "success", noTreeRequest);
			}
			return apiResponse.successResponseWithData(res, "success", requestInfo);
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
	const days = getTimeFilterFromReq(query);

	// Anyone can mock their user view by providing this parameter (only affects non-users)
	const userView = query.userView;
	const showUserView = userView ? (userView.toLowerCase() === "true" ? true : false) : false;

	return getDeliveredRequestsFromCache(days)
		.then(async (resp) => {
			if (isUser(req) || showUserView) {
				// Users should have their requests filtered (IGO members will not have their projects filtered)
				const all = resp["requests"] || [];
				const filteredRequests = await filterProjectsOnHierarchy(req, all, getDeliveredRequestsFromCacheKey(days));
				resp = { ...resp };		// clone - prevents altering the cached value
				resp["requests"] = filteredRequests;
			}
			return apiResponse.successResponseWithData(res, "success", resp);
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
	const days = getTimeFilterFromReq(query);

	// Anyone can mock their user view by providing this parameter (only affects non-users)
	const userView = query.userView;
	const showUserView = userView ? (userView.toLowerCase() === "true" ? true : false) : false;

	return getPendingRequestsFromCache(days)
		.then(async (projects) => {
			if(isUser(req) || showUserView) {
				const all = projects["requests"] || [];
				const filteredRequests = await filterProjectsOnHierarchy(req, all, getPendingRequestsFromCacheKey(days));
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
 * Combines the delivered & undelivered response into one response
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getIgoRequests = async function (req, res) {
	const query = req.query || {};
	const dayFilter = getTimeFilterFromReq(query);

	logger.info(`Retrieving all IGO requests from past ${dayFilter} days`);

	let deliveredResponse, pendingResponse;
	try {
		deliveredResponse = await getDeliveredRequestsFromCache(dayFilter);
		pendingResponse = await getPendingRequestsFromCache(dayFilter);
	} catch(err) {
		return apiResponse.ErrorResponse(res, err.message);
	}

	const deliveredRequests = deliveredResponse.requests || [];
	const pendingRequests = pendingResponse.requests || [];
	const allRequests = deliveredRequests.concat(pendingRequests);

	return apiResponse.successResponseWithData(res, "success", allRequests);
};

/**
 * Clears all entries in the cache
 *
 * @param req
 * @param res
 */
const updateRequestList = async function(req, res){
	const query = req.query || {};
	const days = getTimeFilterFromReq(query);

	const deliveredRequestsKey = getDeliveredRequestsFromCacheKey(days);
	const pendingRequestsKey = getPendingRequestsFromCacheKey(days);

	const numDeleted = cache.del([deliveredRequestsKey, pendingRequestsKey]);
	logger.info(`DEL on ${deliveredRequestsKey}, ${pendingRequestsKey} - Removed ${numDeleted} Key(s)`);

	logger.info(`Updating delivered requests (days=${days})`);
	await getDeliveredRequestsFromCache(days);

	logger.info(`Updating pending requests (days=${days})`);
	await getPendingRequestsFromCache(days);

	const status = `Updated ${deliveredRequestsKey} and ${pendingRequestsKey}`;
	logger.info(status);

	return apiResponse.successResponse(res, status);
};

const getDeliveredRequestsFromCacheKey = function(dayFilter) {
	return `DELIVERED_REQUESTS___${dayFilter}`;
};

const getPendingRequestsFromCacheKey = function(dayFilter) {
	return `PENDING_REQUESTS___${dayFilter}`;
};

const getDeliveredRequestsFromCache = function(dayFilter) {
	const key = getDeliveredRequestsFromCacheKey(dayFilter);
	return cache.get(key, () => getRecentDeliveries(dayFilter));
};

const getPendingRequestsFromCache = function(dayFilter) {
	const key = getPendingRequestsFromCacheKey(dayFilter);
	return cache.get(key, () => getUndeliveredProjects(dayFilter));
};

exports.getIgoRequests = [
	authenticateRequest,
	getIgoRequests
];

/* Application Authentications */
exports.getDeliveredProjects = [
	authenticateRequest,
	getDeliveredRequests
];
exports.getUndeliveredProjects = [
	authenticateRequest,
	getPendingRequests
];
exports.getProjectTrackingData = [
	authenticateRequest,
	getRequestTrackingInfo
];
exports.updateRequestList = [
	authenticateRequest,
	updateRequestList
];
