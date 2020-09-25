const { server } = require("./test-server");
const { getDeliveredProjects, getUndeliveredProjects } = require("../controllers/lims-controller");

const sinon = require("sinon");
var chai = require("chai");
let should = chai.should();

const { LIMS_API } = require("../services/config.js");
const cache = require("../helpers/cache");
const jwtInCookie = require("jwt-in-cookie");
const { createRequestList, MockResponse } = require("./setup-util");

var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");


describe("lims-controller", () => {
	let validateJwtToken;
	beforeEach(() => {
		validateJwtToken = sinon.stub(jwtInCookie, "validateJwtToken");
    });

    afterEach(() => {
        validateJwtToken.restore();
    });

    describe("getDeliveredProjects", () => {
        it("should return filtered projects if user", async () => {
            // Clear cached response
            cache.del("GET_DELIVERED");

            const GIVEN_USER = "user_given";
            const SN_USER = "user_sn";
            const GIVEN_MANAGER = "manager_given";
            const SN_MANAGER = "manager_sn";

            const requests = Object.assign({}, createRequestList(GIVEN_USER, SN_USER, GIVEN_MANAGER, SN_MANAGER));

            // This sets the mock adapter on the default instance
            var mock = new MockAdapter(axios);
            const url = new RegExp(`${LIMS_API}/getIgoRequests*`);
            mock.onGet(url).reply(200, requests);

            /* Performs filtering for requests w/ these representatives */
            validateJwtToken.returns({
                "isUser": true,
                "hierarchy": [
                    { "sn": SN_USER, "givenName": GIVEN_USER },
                    { "sn": SN_MANAGER, "givenName": GIVEN_MANAGER }
                ]
            });

            // We want to test the function that makes the backend request and filters projects
            const targetFunction = getDeliveredProjects[1];
            const res = await targetFunction({}, new MockResponse());

            res.should.have.status(200);
            res.body.should.have.property("message").eql("success");
            res.body.data.requests.length.should.equal(4);
        });
        it("should return all projects if NOT user", async () => {
            // Clear cached response
            cache.del("GET_DELIVERED");

            const GIVEN_USER = "user_given";
            const SN_USER = "user_sn";
            const GIVEN_MANAGER = "manager_given";
            const SN_MANAGER = "manager_sn";
            const requests = Object.assign({}, createRequestList(GIVEN_USER, SN_USER, GIVEN_MANAGER, SN_MANAGER));

            // This sets the mock adapter on the default instance
            var mock = new MockAdapter(axios);
            const url = new RegExp(`${LIMS_API}/getIgoRequests*`);

            mock.onGet(url).reply(200, requests);

            /* Performs filtering for requests w/ these representatives */
            validateJwtToken.returns({
                "isUser": false,
                "hierarchy": [
                    { "sn": SN_USER, "givenName": GIVEN_USER },
                    { "sn": SN_MANAGER, "givenName": GIVEN_MANAGER }
                ]
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
        it("should return filtered projects if user", async () => {
            // Clear cached response
            cache.del("GET_UNDELIVERED");

            const GIVEN_USER = "user_given";
            const SN_USER = "user_sn";
            const GIVEN_MANAGER = "manager_given";
            const SN_MANAGER = "manager_sn";
            const requests = Object.assign({}, createRequestList(GIVEN_USER, SN_USER, GIVEN_MANAGER, SN_MANAGER));

            // This sets the mock adapter on the default instance
            var mock = new MockAdapter(axios);

            const url = new RegExp(`${LIMS_API}/getIgoRequests*`);
            mock.onGet(url).reply(200, requests);

            /* Performs filtering for requests w/ these representatives */
            validateJwtToken.returns({
                "isUser": true,
                "hierarchy": [
                    { "sn": SN_USER, "givenName": GIVEN_USER },
                    { "sn": SN_MANAGER, "givenName": GIVEN_MANAGER }
                ]
            });

            // We want to test the function that makes the backend request and filters projects
            const targetFunction = getUndeliveredProjects[1];
            const res = await targetFunction({}, new MockResponse());

            res.should.have.status(200);
            res.body.should.have.property("message").eql("success");
            res.body.data.requests.length.should.equal(4);
        })
        it("should return all projects if NOT user", async () => {
            // Clear cached response
            cache.del("GET_UNDELIVERED");

            const GIVEN_USER = "user_given";
            const SN_USER = "user_sn";
            const GIVEN_MANAGER = "manager_given";
            const SN_MANAGER = "manager_sn";
            const requests = Object.assign({}, createRequestList(GIVEN_USER, SN_USER, GIVEN_MANAGER, SN_MANAGER));

            // This sets the mock adapter on the default instance
            var mock = new MockAdapter(axios);
            const url = new RegExp(`${LIMS_API}/getIgoRequests*`);
            mock.onGet(url).reply(200, requests);

            /* Performs filtering for requests w/ these representatives */
            validateJwtToken.returns({
                "isUser": false,
                "hierarchy": [
                    { "sn": SN_USER, "givenName": GIVEN_USER },
                    { "sn": SN_MANAGER, "givenName": GIVEN_MANAGER }
                ]
            });

            // We want to test the function that makes the backend request and filters projects
            const targetFunction = getUndeliveredProjects[1];
            const res = await targetFunction({}, new MockResponse());

            res.should.have.status(200);
            res.body.should.have.property("message").eql("success");
            res.body.data.requests.length.should.equal(6);
        })
    });
});
