const {server} = require("./test-server");
const {getDeliveredProjects, getUndeliveredProjects} = require("../controllers/lims-controller");

const sinon = require("sinon");
var chai = require("chai");
let should = chai.should();

const {userCollection} = require("../db/data-access");
const cache = require("../helpers/cache");
const jwtInCookie = require("jwt-in-cookie");
const {createRequestList, MockResponse} = require("./setup-util");
const LIMS_API = process.env.LIMS_API;

var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");


describe("lims-controller", () => {
	let validateJwtToken_stub;
	let userCollectionFindOne_stub;

	beforeEach(() => {
		validateJwtToken_stub = sinon.stub(jwtInCookie, "validateJwtToken");
		userCollectionFindOne_stub = sinon.stub(userCollection, "findOne");
	});

	afterEach(() => {
		validateJwtToken_stub.restore();
		userCollectionFindOne_stub.restore();
	});

	describe("getDeliveredProjects", () => {
		it("should return filtered requests if user", async () => {
			// Clear cached response
			cache.del("GET_DELIVERED");

			const CURRENT_USER = "CURRENT_USER";
			const CURRENT_USER_EMAIL = `${CURRENT_USER}@mskcc.org`;
			const LEGACY_USER = "LEGACY_USER";
			const LEGACY_USER_EMAIL = "R-LEGACY_USE@ski.mskcc.org";
			const requests = Object.assign({}, createRequestList(CURRENT_USER_EMAIL, LEGACY_USER_EMAIL));

			// This sets the mock adapter on the default instance
			var mock = new MockAdapter(axios);
			const url = new RegExp(`${LIMS_API}/getIgoRequests*`);
			mock.onGet(url).reply(200, requests);

			/* Performs filtering for requests w/ these representatives */
			validateJwtToken_stub.returns({
				"isUser": true
			});
			userCollectionFindOne_stub.returns({
				"groups": `CN=${CURRENT_USER},CN=${LEGACY_USER}`
			});

			// We want to test the function that makes the backend request and filters projects
			const targetFunction = getDeliveredProjects[1];
			const res = await targetFunction({}, new MockResponse());

			res.should.have.status(200);
			res.body.should.have.property("message").eql("success");
			res.body.data.requests.length.should.equal(4);
		});
		it("should return all requests if NOT user", async () => {
			// Clear cached response
			cache.del("GET_DELIVERED");

			const CURRENT_USER = "CURRENT_USER";
			const CURRENT_USER_EMAIL = `${CURRENT_USER}@mskcc.org`;
			const LEGACY_USER = "LEGACY_USER";
			const LEGACY_USER_EMAIL = "R-LEGACY_USE@ski.mskcc.org";
			const requests = Object.assign({}, createRequestList(CURRENT_USER_EMAIL, LEGACY_USER_EMAIL));

			// This sets the mock adapter on the default instance
			var mock = new MockAdapter(axios);
			const url = new RegExp(`${LIMS_API}/getIgoRequests*`);

			mock.onGet(url).reply(200, requests);

			/* Performs filtering for requests w/ these representatives */
			validateJwtToken_stub.returns({
				"isUser": false
			});
			userCollectionFindOne_stub.returns({
				"groups": `CN=${CURRENT_USER},CN=${LEGACY_USER}`
			});

			// We want to test the function that makes the backend request and filters projects
			const targetFunction = getDeliveredProjects[1];
			const res = await targetFunction({}, new MockResponse());

			res.should.have.status(200);
			res.body.should.have.property("message").eql("success");
			res.body.data.requests.length.should.equal(6);
		});
	});

	describe("getUndeliveredProjects", () => {
		it("should return filtered requests if user", async () => {
			// Clear cached response
			cache.del("GET_UNDELIVERED");

			const CURRENT_USER = "CURRENT_USER";
			const CURRENT_USER_EMAIL = `${CURRENT_USER}@mskcc.org`;
			const LEGACY_USER = "LEGACY_USER";
			const LEGACY_USER_EMAIL = "R-LEGACY_USE@ski.mskcc.org";
			const requests = Object.assign({}, createRequestList(CURRENT_USER_EMAIL, LEGACY_USER_EMAIL));

			// This sets the mock adapter on the default instance
			var mock = new MockAdapter(axios);

			const url = new RegExp(`${LIMS_API}/getIgoRequests*`);
			mock.onGet(url).reply(200, requests);

			/* Performs filtering for requests w/ these representatives */
			validateJwtToken_stub.returns({
				"isUser": true
			});
			userCollectionFindOne_stub.returns({
				"groups": `CN=${CURRENT_USER},CN=${LEGACY_USER}`
			});

			// We want to test the function that makes the backend request and filters projects
			const targetFunction = getUndeliveredProjects[1];
			const res = await targetFunction({}, new MockResponse());

			res.should.have.status(200);
			res.body.should.have.property("message").eql("success");
			res.body.data.requests.length.should.equal(4);
		});
		it("should return all requests if NOT user", async () => {
			// Clear cached response
			cache.del("GET_UNDELIVERED");

			const CURRENT_USER = "CURRENT_USER";
			const CURRENT_USER_EMAIL = `${CURRENT_USER}@mskcc.org`;
			const LEGACY_USER = "LEGACY_USER";
			const LEGACY_USER_EMAIL = "R-LEGACY_USE@ski.mskcc.org";
			const requests = Object.assign({}, createRequestList(CURRENT_USER_EMAIL, LEGACY_USER_EMAIL));

			// This sets the mock adapter on the default instance
			var mock = new MockAdapter(axios);
			const url = new RegExp(`${LIMS_API}/getIgoRequests*`);
			mock.onGet(url).reply(200, requests);

			/* Performs filtering for requests w/ these representatives */
			validateJwtToken_stub.returns({
				"isUser": false
			});
			userCollectionFindOne_stub.returns({
				"groups": `CN=${CURRENT_USER},CN=${LEGACY_USER}`
			});

			// We want to test the function that makes the backend request and filters projects
			const targetFunction = getUndeliveredProjects[1];
			const res = await targetFunction({}, new MockResponse());

			res.should.have.status(200);
			res.body.should.have.property("message").eql("success");
			res.body.data.requests.length.should.equal(6);
		});
	});
});
