const sinon = require("sinon");
var chai = require("chai");
const expect = chai.expect;

const jwtInCookie = require("jwt-in-cookie");
const {isUser} = require("../helpers/utility");


describe("utility", () => {
    describe("isUser", () => {
        it("it should retrieve the isUser value if present in the cookie", () => {
            const callback = sinon.stub(jwtInCookie, "validateJwtToken");
            callback.onCall(0).returns({"isUser": true});
            expect(isUser({})).to.equal(true);
        });
    });
});
