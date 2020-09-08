const jwtInCookie = require("jwt-in-cookie");
const { logger } = require("../helpers/winston");
const ldap = require("ldapjs");

// Fields in the ldap response that will be used to filter projects on
const HIERARCHY_FILTERS = ["sn", "givenName"];
const HIERARCHY_TARGETS = ["investigator", "pi"];
const HIERARCHY_DEPTH = 3;							// Upward levels from the user to create the filtering hierarchy

const client = ldap.createClient({
	url: "ldaps://mskcc.root.mskcc.org/", // Error: connect ECONNREFUSED 23.202.231.169:636
	// url: "ldaps://ldapha.mskcc.root.mskcc.org/",	// Error: getaddrinfo ENOTFOUND ldapha.mskcc.root.mskcc.org
	tlsOptions: {
		rejectUnauthorized: false
	}
});

/**
 * Retrieves isUser from the request cookie and returns value of isUser
 * @param req
 */
exports.isUser = (req) => {
	// TODO - remove default search for true
	return true;

	const userData = jwtInCookie.validateJwtToken(req);
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
 * @param data
 */
exports.filterProjectsOnHierarchy = async (req, projects) => {
	const filteredProjects = [];

	// TODO - can send and then await later?
	// TODO - cache
	const userData = jwtInCookie.validateJwtToken(req);
	const userName = "chant"; // userData["username"];		// TODO - take name userName from userData

	const hierarchy = await retrieveHierarchy(userName);
	const usersWithVisibility = hierarchy.map(manager => HIERARCHY_FILTERS.map(field => manager[field]));
	logger.info( `Filtering visible projects for user: "${userName}" w/ representatives: ${(usersWithVisibility)}`);
	for(const project of projects){
		const projectRepresentatives = HIERARCHY_TARGETS.map(field => project[field]).filter(rep => rep !== undefined);
		let hasProjectRepresentative = false;
		for(const pr of projectRepresentatives){
			const containsNames = usersWithVisibility.reduce((containsName, names) => {
				for(const name of names){
					if(!pr.includes(name)){
						// Manager is not the project representative, return the result of previous
						return containsName;
					}
				}
				// Manager is the project representative and user should see the project
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

/**
 * Retrieves the manager's CN of the input user
 * @param client
 * @param user
 * @returns {Promise<unknown>}
 */
const retrieveManagerUserName = async function(client, user) {
	const opts = {
		filter: `(sAMAccountName=${user})`,
		scope: "sub",
		attributes: ["manager"]
	};
	const promise = new Promise(function(resolve, reject) {
		client.search("DC=MSKCC,DC=ROOT,DC=MSKCC,DC=ORG", opts, (err, res) => {
			res.on("searchEntry", function(entry) {
				const result = entry.object;

				// Parse out value of the CN entry in the manager field value
				const managerValue = result["manager"] || "CN=";
				const attributes = managerValue.split(",");
				let kv;

				for(const attr of attributes){
					kv = attr.split("=");
					if("CN" === kv[0]){
						resolve(kv[1]);
						return;
					}
				}
				logger.log("error", `Could not find manager of ${user}`);
				resolve("");
			});
			res.on("searchReference", function(referral) {
				// logger.log("info", "referral: " + referral.uris.join());
			});
			res.on("error", function(err) {
				reject(`LDAP Error: ${err.message}`);
			});
			res.on("end", function(result) {
				// logger.log("info", "status: " + result.status);
				if(result.status !== 0){
					reject(`LDAP Status Fail: ${result.status}`)
				}
			});
		});
	});
	return promise;
};

/**
 * Retrieves hierarchy of users from the user data contained in the request token
 *
 * @param req
 * @returns {{requests: *}}
 */
const retrieveHierarchy = function(userName) {
	// TODO - needs to change to an IGO user
	const IGO_USER = "SAMPLE_USER";
	const IGO_PWD = "IGO_PWD";
	client.bind(IGO_USER, IGO_PWD, function(err) {
		if(err){
			const errorMsg = `Failed bind to LDAP client (User: ${userName}) - ${err.message}`;
			reject(new Error(errorMsg));
		}
	});

	const promise = new Promise(async function(resolve, reject) {
		if(userName) {
			const user = await populateUserDataFromUserName(client, userName);
			const hierarchy = [];
			if(isValidHierarchyEntry(userName, user)){
				hierarchy.push(user);
			}

			let managerUserName = userName;
			let manager;
			logger.log("info", `Populating hierarachy for user: ${userName}`);
			for(let itr = 0; itr < HIERARCHY_DEPTH; itr+=1){
				managerUserName = await retrieveManagerUserName(client, managerUserName);
				// TODO - this can be asynchronous
				manager = await populateUserDataFromUserName(client, managerUserName);
				if(isValidHierarchyEntry(managerUserName, manager)){
					hierarchy.push(manager);
				}
			}

			logger.log("info", `User Hierachy: ${userName} => ${hierarchy.map(m => m["cn"]).join(", ")}`);
			resolve(hierarchy);
		} else {
			logger.log("error", "Failed to filter userData");
		}
	});

	return promise;
};

/**
 * Logs any issues with user entry prior to being added to the hierarchy
 *
 * @param userName
 * @param entry
 * @returns {Promise<void>}
 */
const isValidHierarchyEntry = async function(userName, entry){
	for(const filter of HIERARCHY_FILTERS){
		if(!entry.hasOwnProperty(filter)){
			logger.log("error", `Invalid Hierarchy Entry: ${userName}, ${filter}`);
			return false;
		}
	}
	return true;
};

/**
 * Populates the LDAP user data from the input user name
 *
 * @param client
 * @param userName
 * @returns {Promise<unknown>}
 */
const populateUserDataFromUserName = async function(client, userName) {
	logger.log("info", `Populating data for userName: ${userName}`);
	const opts = {
		filter: `(sAMAccountName=${userName})`,
		scope: "sub",
		attributes: ["dn", "sn", "cn", "title", "givenName", "sAMAccountName", "displayName", "title"]
	};
	const promise = new Promise(function(resolve, reject) {
		client.search("DC=MSKCC,DC=ROOT,DC=MSKCC,DC=ORG", opts, (err, res) => {
			res.on("searchEntry", function(entry) {
				const result = entry.object;
				resolve(result);
			});
			res.on("searchReference", function(referral) {
				// logger.log("info", "referral: " + referral.uris.join());
			});
			res.on("error", function(err) {
				reject(`LDAP Error: ${err.message}`);
			});
			res.on("end", function(result) {
				if(result.status !== 0){
					logger.log("error", "status: " + result.status);
					reject(`LDAP Status Fail: ${result.status}`);
				}
			});
		});
	});
	return promise;
};
