const jwtInCookie = require("jwt-in-cookie");
const apiResponse = require("../helpers/apiResponse");
exports.authenticateRequest = function(req, res, next) {
	if(process.env.NODE_ENV === "dev") {
		next();
		return;
	}
	try {
		jwtInCookie.validateJwtToken(req);
	} catch(err){
		return apiResponse.AuthenticationErrorResponse(res,  "Not authorized - please log in");
	}
	next();
};
