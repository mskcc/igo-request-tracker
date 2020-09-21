const jwtInCookie = require("jwt-in-cookie");
const { logger } = require("../helpers/winston");

// Fields in the ldap response that will be used to filter projects on
const HIERARCHY_FILTERS = ["sn", "givenName"];
const HIERARCHY_TARGETS = ["investigator", "pi"];

/**
 * Retrieves isUser from the request cookie and returns value of isUser
 * @param req
 */
exports.isUser = (req) => {
	if(process.env.ENV === "QA") return false;

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
 */
exports.filterProjectsOnHierarchy = async (req, projects) => {
	const filteredProjects = [];

	const userData = jwtInCookie.validateJwtToken(req);
	const userName = userData["username"];
	const hierarchy = userData["hierarchy"] || [];

	// usersWithVisibility: [ [ LAST_NAME, FIRST_NAME ], ... ]
	const usersWithVisibility = hierarchy.map(hierarchyObject =>
		// hierarchyObject: { sn: Franklin, givenName: Rosalind }
		HIERARCHY_FILTERS.map(field => hierarchyObject[field])
	);
	logger.info( `Filtering visible projects for user: '${userName}' w/ representatives: ${(usersWithVisibility)}`);

	for(const project of projects){
		const projectRepresentatives = HIERARCHY_TARGETS.map(field => project[field]).filter(rep => rep !== undefined);
		let hasProjectRepresentative = false;
		for(const pr of projectRepresentatives){

			// Search for one manager who is a project representative in one of the @HIERARCHY_TARGETS fields
			const containsNames = usersWithVisibility.reduce((containsName, names) => {
				for(const name of names){
					if(!pr.includes(name)){
						// Manager is not the project representative, return the result of previous
						return containsName;
					}
				}
				// At least one manager is a project representative and user should see the project
				return true;
			}, false);
			hasProjectRepresentative = hasProjectRepresentative || containsNames
		}
		if(hasProjectRepresentative){
			filteredProjects.push(project);
		}
	}
	logger.info(`User: ${userName} should see ${filteredProjects.length} projects: ${filteredProjects.map(prj => prj["requestId"])}`);
	return filteredProjects;
};
