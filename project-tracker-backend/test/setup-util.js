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

exports.createRequestList = function(email1, email2) {
    const CURRENT_DATA_ACCESS_EMAIL = "CURRENT_DATA_ACCESS_EMAIL";
    const CURRENT_QC_ACCESS_EMAIL = "CURRENT_QC_ACCESS_EMAIL";
    const LEGACY_DATA_ACCESS_EMAIL = "LEGACY_DATA_ACCESS_EMAIL";
    const LEGACY_QC_ACCESS_EMAIL = "LEGACY_QC_ACCESS_EMAIL";

    const requests = [
        {
            "requestId": CURRENT_DATA_ACCESS_EMAIL,
            "dataAccessEmails": `${email1},u1.mskcc.org`,
            "qcAccessEmail": "",
        },
        {
            "requestId": CURRENT_QC_ACCESS_EMAIL,
            "dataAccessEmails": "",
            "qcAccessEmail": `${email1},u1.mskcc.org`
        },
        {
            "requestId": LEGACY_DATA_ACCESS_EMAIL,
            "dataAccessEmails": `${email2},u1.mskcc.org`,
            "qcAccessEmail": ""
        },
        {
            "requestId": LEGACY_QC_ACCESS_EMAIL,
            "dataAccessEmails": "",
            "qcAccessEmail": `${email2},u1.mskcc.org`
        },
        {
            "requestId": "NOT_RETURNED",
            "dataAccessEmails": "Rosalind Franklin",
            "qcAccessEmail": ""
        },
        {
            "requestId": "NOT_RETURNED",
            "dataAccessEmails": "",
            "qcAccessEmail": "Rosalind Franklin"
        }
    ];

    return {requests};
}
