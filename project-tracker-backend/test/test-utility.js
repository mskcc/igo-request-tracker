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
			const TEST_USER = "streidd";
			const USER_NAME = "David Streid";
			const EXPECTED_MANAGER = "Lisa Wagner";

			const INVESTIGATOR_USER_ID = "INVESTIGATOR_USER_ID";
			const PI_USER_ID = "PI_USER_ID";
			const INVESTIGATOR_HIERARCHY_ID = "INVESTIGATOR_HIERARCHY_ID";
			const PI_HIERARCHY_ID = "PI_HIERARCHY_ID";
			const projects = [
				{
					"requestId": INVESTIGATOR_USER_ID,
					"investigator": USER_NAME,
					"pi": ""
				},
				{
					"requestId": PI_USER_ID,
					"investigator": "",
					"pi": USER_NAME
				},
				{
					"requestId": INVESTIGATOR_HIERARCHY_ID,
					"investigator": EXPECTED_MANAGER,
					"pi": ""
				},
				{
					"requestId": PI_HIERARCHY_ID,
					"investigator": "",
					"pi": EXPECTED_MANAGER
				},
				{
					"requestId": "NOT_RETURNED",
					"investigator": "Rosalind Franklin",
					"pi": ""
				},
				{
					"requestId": "NOT_RETURNED",
					"investigator": "",
					"pi": "Rosalind Franklin"
				}
			];
			callback.returns({"username": TEST_USER});
			const filteredProjects = await filterProjectsOnHierarchy({}, projects);

			const expectedFilteredIDs = new Set([ INVESTIGATOR_USER_ID, PI_USER_ID, INVESTIGATOR_HIERARCHY_ID, PI_HIERARCHY_ID ]);
			const actualFilteredIDs = filteredProjects.map(p => p["requestId"]);
			expect(filteredProjects.length).to.equal(expectedFilteredIDs.size);
			for(const id of actualFilteredIDs){
				expect(expectedFilteredIDs.has(id)).to.equal(true);
			}
		});
	});
});
