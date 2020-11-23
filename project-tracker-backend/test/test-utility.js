const {createRequestList} = require("./setup-util");

const sinon = require("sinon");
var chai = require("chai");
const expect = chai.expect;

const jwtInCookie = require("jwt-in-cookie");
const { userCollection } = require("../db/data-access");
const {isUser} = require("../helpers/utility");
const { filterProjectsOnHierarchy } = require("../helpers/utility");

describe("utility", () => {
	let validateJwtToken_stub;
	let userCollectionFindOne_stub;

	const CURRENT_DATA_ACCESS_EMAIL = "CURRENT_DATA_ACCESS_EMAIL";
	const CURRENT_QC_ACCESS_EMAIL = "CURRENT_QC_ACCESS_EMAIL";
	const LEGACY_DATA_ACCESS_EMAIL = "LEGACY_DATA_ACCESS_EMAIL";
	const LEGACY_QC_ACCESS_EMAIL = "LEGACY_QC_ACCESS_EMAIL";
	
	beforeEach(() => {
		validateJwtToken_stub = sinon.stub(jwtInCookie, "validateJwtToken");
		userCollectionFindOne_stub = sinon.stub(userCollection, "findOne");
	});

	afterEach(() => {
		validateJwtToken_stub.restore();
		userCollectionFindOne_stub.restore();
	});

	describe("isUser", () => {
		it("it should retrieve the isUser value if present in the cookie", () => {
			validateJwtToken_stub.onCall(0).returns({"isUser": true});
			validateJwtToken_stub.onCall(1).returns({"isUser": false});
			expect(isUser({})).to.equal(true);
			expect(isUser({})).to.equal(false);
		});
	});

	describe("filterProjectsOnHierarchy", () => {
		it("should return CURRENT_USER & LEGACY_USER requests (mongo userData filtering)", async () => {
			const CURRENT_USER="CURRENT_USER";
			const CURRENT_USER_EMAIL=`${CURRENT_USER}@mskcc.org`;
			const LEGACY_USER="LEGACY_USER";
			const LEGACY_USER_EMAIL="R-LEGACY_USE@ski.mskcc.org";
			const { requests } = createRequestList(CURRENT_USER_EMAIL, LEGACY_USER_EMAIL);

			validateJwtToken_stub.returns({
				username: "USERNAME_NOT_IN_REQUESTS"
			});
			/* Performs filtering for requests w/ these representatives */
			userCollectionFindOne_stub.returns({
				"groups": `CN=${CURRENT_USER},CN=${LEGACY_USER}`
			});

			const filteredProjects = await filterProjectsOnHierarchy({}, requests);

			const expectedFilteredIDs = new Set([ CURRENT_DATA_ACCESS_EMAIL, CURRENT_QC_ACCESS_EMAIL, LEGACY_DATA_ACCESS_EMAIL, LEGACY_QC_ACCESS_EMAIL ]);
			const actualFilteredIDs = filteredProjects.map(p => p["requestId"]);

			for(const id of actualFilteredIDs){
				expect(expectedFilteredIDs.has(id)).to.equal(true);
			}
			expect(filteredProjects.length).to.equal(expectedFilteredIDs.size);
		});
	});

	describe("filterProjectsOnHierarchy", () => {
		it("should get requests with different userName cases (mongo userData filtering)", async () => {
			const CURRENT_USER="CURRENT_USER";
			const WEIRD_CASE_CURRENT_USER = "CuRrEnT_uSeR";
			const LOWER_CASE_CURRENT_USER_EMAIL=`${WEIRD_CASE_CURRENT_USER}@mskcc.org`;
			const LEGACY_USER_FORMAT="R-lEgAcY_uSe";
			const WEIRD_CASE_LEGACY_USER="LeGaCy_UsEr";
			const LEGACY_USER_EMAIL=`${LEGACY_USER_FORMAT}@ski.mskcc.org`;

			const { requests } = createRequestList(LOWER_CASE_CURRENT_USER_EMAIL, LEGACY_USER_EMAIL);

			validateJwtToken_stub.returns({
				username: "USERNAME_NOT_IN_REQUESTS"
			});
			/* Performs filtering for requests w/ these representatives */
			userCollectionFindOne_stub.returns({
				"groups": `CN=${CURRENT_USER},CN=${WEIRD_CASE_LEGACY_USER}`
			});

			const filteredProjects = await filterProjectsOnHierarchy({}, requests);

			const expectedFilteredIDs = new Set([ CURRENT_DATA_ACCESS_EMAIL, CURRENT_QC_ACCESS_EMAIL, LEGACY_DATA_ACCESS_EMAIL, LEGACY_QC_ACCESS_EMAIL ]);
			const actualFilteredIDs = filteredProjects.map(p => p["requestId"]);

			for(const id of actualFilteredIDs){
				expect(expectedFilteredIDs.has(id)).to.equal(true);
			}
			expect(filteredProjects.length).to.equal(expectedFilteredIDs.size);
		});
	});


	describe("filterProjectsOnHierarchy", () => {
		it("should return CURRENT_USER & LEGACY_USER requests (jwt username)", async () => {
			const CURRENT_USER="CURRENT_USER";
			const CURRENT_USER_EMAIL=`${CURRENT_USER}@mskcc.org`;
			const LEGACY_USER_FORMAT="R-lEgAcY_uSe";
			const WEIRD_CASE_LEGACY_USER="LeGaCy_UsEr";
			const LEGACY_USER_EMAIL=`${LEGACY_USER_FORMAT}@ski.mskcc.org`;

			const { requests } = createRequestList(CURRENT_USER_EMAIL, LEGACY_USER_EMAIL);

			/* Performs filtering for requests on just the user & should only get legacy requests */
			validateJwtToken_stub.returns({
				username: WEIRD_CASE_LEGACY_USER
			});
			const expectedFilteredIDs = new Set([ LEGACY_DATA_ACCESS_EMAIL, LEGACY_QC_ACCESS_EMAIL ]);

			userCollectionFindOne_stub.returns({
				"groups": ""
			});


			const filteredProjects = await filterProjectsOnHierarchy({}, requests);

			const actualFilteredIDs = filteredProjects.map(p => p["requestId"]);

			for(const id of actualFilteredIDs){
				expect(expectedFilteredIDs.has(id)).to.equal(true);
			}
			expect(filteredProjects.length).to.equal(expectedFilteredIDs.size);
		});
	});

	describe("filterProjectsOnHierarchy", () => {
		it("should get requests with different userName cases (jwt username)", async () => {
			const CURRENT_USER="CURRENT_USER";
			const CURRENT_USER_EMAIL=`${CURRENT_USER}@mskcc.org`;
			const LEGACY_USER_FORMAT="R-lEgAcY_uSe";
			const WEIRD_CASE_LEGACY_USER="LeGaCy_UsEr";
			const LEGACY_USER_EMAIL=`${LEGACY_USER_FORMAT}@ski.mskcc.org`;

			const { requests } = createRequestList(CURRENT_USER_EMAIL, LEGACY_USER_EMAIL);

			/* Performs filtering for requests on just the user & should only get legacy requests */
			validateJwtToken_stub.returns({
				username: WEIRD_CASE_LEGACY_USER
			});
			const expectedFilteredIDs = new Set([ LEGACY_DATA_ACCESS_EMAIL, LEGACY_QC_ACCESS_EMAIL ]);

			userCollectionFindOne_stub.returns({
				"groups": ""
			});


			const filteredProjects = await filterProjectsOnHierarchy({}, requests);

			const actualFilteredIDs = filteredProjects.map(p => p["requestId"]);

			for(const id of actualFilteredIDs){
				expect(expectedFilteredIDs.has(id)).to.equal(true);
			}
			expect(filteredProjects.length).to.equal(expectedFilteredIDs.size);
		});
	});
});
