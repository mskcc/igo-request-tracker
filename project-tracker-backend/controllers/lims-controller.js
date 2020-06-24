const apiResponse = require("../helpers/apiResponse");
const {authenticateRequest} = require("../middlewares/jwt-cookie");
const {getRecentDeliveries, getUndeliveredProjects, getProjectTrackingInfo} = require("../services/services");
const Cache = require("../helpers/cache");
const ttl = 60 * 60 * 1; // cache for 1 Hour
const cache = new Cache(ttl); // Create a new cache service instance

/**
 * Returns a list of all projects the user is able to see
 *
 * @returns {Object}
 */
exports.getDeliveredProjects = [
	authenticateRequest,
	function (req, res) {
		const key = "GET_DELIVERED";
		const retrievalFunc = () => getRecentDeliveries();
		return cache.get(key, retrievalFunc)
			.then((projects) => {
				return apiResponse.successResponseWithData(res, "success", projects);
			})
			.catch((err) => {
				return apiResponse.ErrorResponse(res, err.message);
			});
	}
];

/**
 * Returns Projects that have not been delivered yet
 *
 * @type {*[]}
 */
exports.getUndeliveredProjects = [
	authenticateRequest,
	function (req, res) {
		const key = "GET_UNDELIVERED";
		const retrievalFunc = () => getUndeliveredProjects();
		return cache.get(key, retrievalFunc)
			.then((projects) => {
				return apiResponse.successResponseWithData(res, "success", projects);
			})
			.catch((err) => {
				return apiResponse.ErrorResponse(res, err.message);
			});
	}
];

exports.getProjectTrackingData = [
	authenticateRequest,
	function (req, res) {
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
	}
];
