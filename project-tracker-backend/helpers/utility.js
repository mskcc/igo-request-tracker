const jwtInCookie = require("jwt-in-cookie");
const { logger } = require("../helpers/winston");
const { userCollection } = require("../db/data-access");

// TODO - Remove Spring 2021 (all requests from past year should have AccessEmail fields
const MISSING_ACCESS_GROUPS = new Set();

/**
 * Retrieves isUser from the request cookie and returns value of isUser
 * @param req
 */
exports.isUser = (req) => {
	if(process.env.NODE_ENV === "dev") return false;

	let userData;
	try {
		userData = jwtInCookie.validateJwtToken(req);
	} catch (err) {
		return true; // Default to true
	}
	// TODO - constant
	if(!userData.hasOwnProperty("isUser")){
		logger.log("error", `Couldn't retrieve "isUser" value from cookie: ${JSON.stringify(userData)}`);
		return true;
	}
	return userData["isUser"];
};

/**
 * Filters projects for representatives that should be viewable to the user
 *
 * @param data, [] - Array of project objects
 * @param key - logging information "request", "DELIVERED_REQUESTS", "PENDING_REQUESTS"
 */
exports.filterProjectsOnHierarchy = async (apiReq, requests, key = "requests") => {
	const userData = jwtInCookie.validateJwtToken(apiReq);
	const userNameValue = userData["username"] || "";
	const userName = userNameValue.toLowerCase();
	const visibilityGroups = await createVisibilityGroupsFromUserData(userName);

	logger.info(`Filtering ${key} based on userName (${userName}) visibility Groups: '${[...visibilityGroups].join("', '")}'`);

	// Add all requests w/ at least one @accessGroups present in the visibilityGroups for user
	let accessGroups, reqId;
	const filteredRequests = [];

	const requestsMissingAccessGroups = [];

	for(const request of requests){
		accessGroups = getAccessGroups(request);
		reqId = request["requestId"];
		// TODO - Remove Spring 2021 (all requests from past year should have AccessEmail fields
		if(accessGroups.length === 0){
		    if(!MISSING_ACCESS_GROUPS.has(reqId)){
		        MISSING_ACCESS_GROUPS.add(reqId);
		    }
		} else {
			logger.info(`Request (${reqId}) Access Groups: ${accessGroups.join(",")}`);
		}
		if(userHasAccessGroup(accessGroups, visibilityGroups)){
			filteredRequests.push(request);
		}
	}

	logger.error(`${MISSING_ACCESS_GROUPS.size} requests are missing access groups and cannot be filtered: ${[... MISSING_ACCESS_GROUPS].join(",")}`);
	logger.info(`User: ${userName} should see ${filteredRequests.length} ${key}: ${filteredRequests.map(prj => prj["requestId"])}`);

	return filteredRequests;
};

const getSavedUserGroups = async (username) => {
	const userDoc = await userCollection.findOne({ username });

	if(!userDoc){
		logger.error(`No user w/ username: ${username}`);
		return [];
	}
	const groupsValue = userDoc[ "groups" ];
	const cnGroups = groupsValue.split(",");
	const groups = [];
	for(const cnGroup of cnGroups){
		const groupSplit = cnGroup.split("CN=");
		if(groupSplit.length === 2){
			groups.push( groupSplit[1].toLowerCase() );
		}
	}
	return groups;
};

/**
 * Parses and formats AccessEmail fields from request object
 *
 * @param userData - { ..., dataAccessEmails: "user@ski.mskcc.org", ..., qcAccessEmail: "user@mskcc.org", ... }
 */
const getAccessGroups = (request) => {
	const dataAccessEmailsValue = request["dataAccessEmails"] || "";
	const qcAccessEmailsValue = request["qcAccessEmail"] || "";

	const dataAccessEmails = dataAccessEmailsValue.split(",");
	const qcAccessEmails = qcAccessEmailsValue.split(",");

	const accessEmails = dataAccessEmails.concat(qcAccessEmails);
	const accessGroups = [];
	const unrecognizedEmails = new Set();
	for(const emailValue of accessEmails){
		const email = emailValue.toLowerCase();
		let accessGroup;
		if( email.includes("@ski.mskcc.org") ){
			// Legacy email format: {FIRST_INITIAL}-{LAST_NAME}@ski.mskcc.org
			const user = email.split("@ski.mskcc.org")[0];
			const firstInitial = user.substring(0,1);
			const lastName = user.substring(2,user.length);
			accessGroup = `${lastName}${firstInitial}`;
		} else if ( email.includes("@mskcc.org") ) {
			accessGroup = email.split("@mskcc.org")[0];
		} else {
			if(email !== ""){
				unrecognizedEmails.add(email);
			}
			continue;
		}
		accessGroups.push(accessGroup.toLowerCase());
	}

	if(unrecognizedEmails.size > 0){
		logger.error(`Could not parse accessGroups from ${unrecognizedEmails.size} emails for request ${request["requestId"] || 'ERROR'}: ${[... unrecognizedEmails].join(",")}`);
	}

	return accessGroups;
};

/**
 * Returns a set of LDAP groups for a user
 *
 * @param userData - { ..., "groups": [ "CN=...,CN=..." ], "username": "user", ... }
 */
const createVisibilityGroupsFromUserData = async (userName) => {
	const groups = await getSavedUserGroups(userName);
	const visibilityGroups = new Set(groups);
	visibilityGroups.add(userName);

	return visibilityGroups;
};

/**
 * Checks if the given accessGroups are present in the set of groups of the visibilityGroups
 *    e.g.  accessGroups: [ "u1" ], visibilityGroups: { "u1" }   ->      true
 *          accessGroups: [ "u2" ], visibilityGroups: { "u1" }   ->      false
 *
 * @param accessGroups - List of LDAP groups being checked for membership
 * @param visibilityGroups - set of LDAP groups being checked against
 */
const userHasAccessGroup = (accessGroups, visibilityGroups) => {
	for(const accessGroup of accessGroups){
		if(visibilityGroups.has(accessGroup)){
			return true;
		}
	}
	return false;
};

