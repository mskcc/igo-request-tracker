const apiResponse = require("../helpers/apiResponse");
const {getRecentDeliveries} = require("../services/services");
const Cache = require("../helpers/cache");
const ttl = 60 * 60 * 1; // cache for 1 Hour
const cache = new Cache(ttl); // Create a new cache service instance

/**
 * Receive feedback request
 *
 * @returns {Object}
 */
exports.submitFeedback = [
	function (req, res) {
		const key = "SUBMIT_FEEDBACK";
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
