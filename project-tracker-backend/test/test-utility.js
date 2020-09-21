const {createRequestList} = require("./setup-util");

const sinon = require("sinon");
var chai = require("chai");
const expect = chai.expect;

const jwtInCookie = require("jwt-in-cookie");
const {isUser} = require("../helpers/utility");
const { filterProjectsOnHierarchy } = require("../helpers/utility");

describe("utility", () => {
	let callback;
	beforeEach(() => {
		callback = sinon.stub(jwtInCookie, "validateJwtToken");
	});

	afterEach(() => {
		callback.restore();
	});

	describe("isUser", () => {
		it("it should retrieve the isUser value if present in the cookie", () => {
			callback.onCall(0).returns({"isUser": true});
			callback.onCall(1).returns({"isUser": false});
			expect(isUser({})).to.equal(true);
			expect(isUser({})).to.equal(false);
		});
	});

	describe("filterProjectsOnHierarchy", () => {
		it("should return projects filtered by hierarchy", async () => {
			/**
			 * Note - If this test fails, replace TEST_USER, USER_NAME, & EXPECTED_MANAGER w/ different users
			 */

			const SN_USER = "David";
			const GIVEN_USER = "Streid";
			const SN_MANAGER = "Lisa";
			const GIVEN_MANAGER = "Wagner";

			const requests = createRequestList(GIVEN_USER, SN_USER, GIVEN_MANAGER, SN_MANAGER);

			/* Performs filtering for requests w/ these representatives */
			callback.returns({
				"hierarchy": [
					{ "sn": SN_USER, "givenName": GIVEN_USER },
					{ "sn": SN_MANAGER, "givenName": GIVEN_MANAGER }
				]
			});
			// These four requestIDs should be returned, see @createRequestList
			const INVESTIGATOR_USER_ID = "INVESTIGATOR_USER_ID";
			const PI_USER_ID = "PI_USER_ID";
			const INVESTIGATOR_HIERARCHY_ID = "INVESTIGATOR_HIERARCHY_ID";
			const PI_HIERARCHY_ID = "PI_HIERARCHY_ID";

			const filteredProjects = await filterProjectsOnHierarchy({}, requests);

			const expectedFilteredIDs = new Set([ INVESTIGATOR_USER_ID, PI_USER_ID, INVESTIGATOR_HIERARCHY_ID, PI_HIERARCHY_ID ]);
			const actualFilteredIDs = filteredProjects.map(p => p["requestId"]);
			expect(filteredProjects.length).to.equal(expectedFilteredIDs.size);
			for(const id of actualFilteredIDs){
				expect(expectedFilteredIDs.has(id)).to.equal(true);
			}
		});
	});
});
