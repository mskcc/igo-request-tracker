const cache = require("../helpers/cache");
const apiResponse = require("../helpers/apiResponse");
const { filterProjectsOnHierarchy, isUser } = require("../helpers/utility");
const { getRecentDeliveries, getUndeliveredProjects, getProjectTrackingInfo } = require("../services/services");
const { authenticateRequest } = require("../middlewares/jwt-cookie");

/**
 * Returns a list of all projects the user is able to see
 *
 * @returns {Object}
 */
exports.getDeliveredProjects = [
	authenticateRequest,
	async function (req, res) {
		const key = "GET_DELIVERED";
		return cache.get(key, getRecentDeliveries)
			.then(async (projects) => {
				if (isUser(req)) {
					// Users should have their requests filtered (IGO members will not have their projects filtered)
					const all = projects["requests"] || [];
					const filteredRequests = await filterProjectsOnHierarchy(req, all);
					projects["requests"] = filteredRequests;
				}
				return apiResponse.successResponseWithData(res, "success", projects);
			})
			.catch((err) => {
				return apiResponse.ErrorResponse(res, err.message);
			})
	}
];

/**
 * Returns Projects that have not been delivered yet
 *
 * @type {*[]}
 */
exports.getUndeliveredProjects = [
	authenticateRequest,
	async function (req, res) {
		const key = "GET_UNDELIVERED";
		return cache.get(key, getUndeliveredProjects)
			.then(async (projects) => {
				if(isUser(req)) {
					const all = projects["requests"] || [];
					const filteredRequests = await filterProjectsOnHierarchy(req, all);
					projects["requests"] = filteredRequests;
				}
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
