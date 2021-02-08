const jwtInCookie = require("jwt-in-cookie");
const auth = require("basic-auth");

const apiResponse = require("../helpers/apiResponse");
const api_users = require("../services/api-users");
const { logger } = require("../helpers/winston");

/**
 * Returns whether input username and password are api users
 *
 * @returns boolean
 */
const is_api_user = function(auth_user) {
	const username = auth_user.name;
	const password = auth_user.pass;

	if(!auth_user){
		return false;
	}

	return api_users[username] && api_users[username] === password;
};

/**
 * Authenticates the request cookie or authorization headers
 * @param req
 * @param res
 * @param next
 */
exports.authenticateRequest = function(req, res, next) {
	/*
	if(process.env.NODE_ENV === "dev") {
		next();
		return;
	}
	*/

	try {
		// Check cookie for token
		logger.info(jwtInCookie.validateJwtToken(req));
		logger.info("Successful cookie authentication");
	} catch(err){
		// If no cookie, then check for api authentication
		const user = auth(req) || {};
		const username = user.name
		if (is_api_user(user)) {
			logger.info(`Successful API authentication (${username})`);
			// Successful login - prepare valid JWT token for future authentication
			jwtInCookie.setJwtToken(res, { "api_token": "request-tracker", "date": new Date() });
		} else {
			logger.info(`Failed API authentication (${username})`);
			res.set("WWW-Authenticate", "Basic");
			return apiResponse.AuthenticationErrorResponse(res,  "Not authorized - please log in");
		}
	}
	next();
};
