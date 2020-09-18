/**
 * Simple mock of express response object
 */
exports.MockResponse = class MockResponse {
    constructor() {
        this.body = {};
    }

    /**
     * Mocks status setting, e.g. res.status(200)
     *      * Note - resets this property to an int
     * @param code
     * @returns {MockResponse}
     */
    status(code) {
        this.status = code;
        return this;
    }

    /**
     * Mocks body setting of request, e.g. res.json(resData);
     * @param body
     * @returns {MockResponse}
     */
    json(body) {
        this.body = body;
        return this;
    }
};

exports.createRequestList = function(user_given, user_ns, manager_given, manager_sn) {
    const USER_NAME = `${user_given}${user_ns}`;
    const EXPECTED_MANAGER = `${manager_given} ${manager_sn}`;

    const INVESTIGATOR_USER_ID = "INVESTIGATOR_USER_ID";
    const PI_USER_ID = "PI_USER_ID";
    const INVESTIGATOR_HIERARCHY_ID = "INVESTIGATOR_HIERARCHY_ID";
    const PI_HIERARCHY_ID = "PI_HIERARCHY_ID";

    const requests = [
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

    return requests;
}
