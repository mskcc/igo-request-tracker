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
		it("should return CURRENT_USER & LEGACY_USER requests filtered by jwt token's user data", async () => {
		    const CURRENT_USER="CURRENT_USER";
		    const CURRENT_USER_EMAIL=`${CURRENT_USER}@mskcc.org`;
		    const LEGACY_USER="LEGACY_USER";
		    const LEGACY_USER_EMAIL=`R-LEGACY_USE@ski.mskcc.org`
			const { requests } = createRequestList(CURRENT_USER_EMAIL, LEGACY_USER_EMAIL);

			/* Performs filtering for requests w/ these representatives */
			callback.returns({
				"groups": `CN=${CURRENT_USER},CN=${LEGACY_USER}`
			});
			// These four requestIDs should be returned, see @createRequestList
			const CURRENT_DATA_ACCESS_EMAIL = "CURRENT_DATA_ACCESS_EMAIL";
			const CURRENT_QC_ACCESS_EMAIL = "CURRENT_QC_ACCESS_EMAIL";
			const LEGACY_DATA_ACCESS_EMAIL = "LEGACY_DATA_ACCESS_EMAIL";
			const LEGACY_QC_ACCESS_EMAIL = "LEGACY_QC_ACCESS_EMAIL";

			const filteredProjects = await filterProjectsOnHierarchy({}, requests);

			const expectedFilteredIDs = new Set([ CURRENT_DATA_ACCESS_EMAIL, CURRENT_QC_ACCESS_EMAIL, LEGACY_DATA_ACCESS_EMAIL, LEGACY_QC_ACCESS_EMAIL ]);
			const actualFilteredIDs = filteredProjects.map(p => p["requestId"]);

			for(const id of actualFilteredIDs){
			    console.log(id);
				expect(expectedFilteredIDs.has(id)).to.equal(true);
			}
			expect(filteredProjects.length).to.equal(expectedFilteredIDs.size);
		});
	});


    describe("should get requests with different userName cases", () => {
        it("should return CURRENT_USER & LEGACY_USER requests filtered by jwt token's user data", async () => {
            const CURRENT_USER="CURRENT_USER";
            const WEIRD_CASE_CURRENT_USER = "CuRrEnT_uSeR";
            const LOWER_CASE_CURRENT_USER_EMAIL=`${WEIRD_CASE_CURRENT_USER}@mskcc.org`;
            const LEGACY_USER="LEGACY_USER";
            const LEGACY_USER_FORMAT="R-lEgAcY_uSe"
            const WEIRD_CASE_LEGACY_USER="LeGaCy_UsEr";
            const LEGACY_USER_EMAIL=`${LEGACY_USER_FORMAT}@ski.mskcc.org`

            const { requests } = createRequestList(LOWER_CASE_CURRENT_USER_EMAIL, LEGACY_USER_EMAIL);

            /* Performs filtering for requests w/ these representatives */
            callback.returns({
                "groups": `CN=${CURRENT_USER},CN=${WEIRD_CASE_LEGACY_USER}`
            });
            // These four requestIDs should be returned, see @createRequestList
            const CURRENT_DATA_ACCESS_EMAIL = "CURRENT_DATA_ACCESS_EMAIL";
            const CURRENT_QC_ACCESS_EMAIL = "CURRENT_QC_ACCESS_EMAIL";
            const LEGACY_DATA_ACCESS_EMAIL = "LEGACY_DATA_ACCESS_EMAIL";
            const LEGACY_QC_ACCESS_EMAIL = "LEGACY_QC_ACCESS_EMAIL";

            const filteredProjects = await filterProjectsOnHierarchy({}, requests);

            const expectedFilteredIDs = new Set([ CURRENT_DATA_ACCESS_EMAIL, CURRENT_QC_ACCESS_EMAIL, LEGACY_DATA_ACCESS_EMAIL, LEGACY_QC_ACCESS_EMAIL ]);
            const actualFilteredIDs = filteredProjects.map(p => p["requestId"]);

            for(const id of actualFilteredIDs){
                console.log(id);
                expect(expectedFilteredIDs.has(id)).to.equal(true);
            }
            expect(filteredProjects.length).to.equal(expectedFilteredIDs.size);
        });
    });
});
