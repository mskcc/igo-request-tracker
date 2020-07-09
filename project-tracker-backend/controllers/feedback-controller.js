const apiResponse = require('../helpers/apiResponse');
const { logger } = require('../helpers/winston');

const REQUIRED_FIELDS = ['body', 'type', 'subject'];
const OPTIONAL_FIELDS = ['project'];
const FeedbackModel = require('../models/feedback');

const parseModelFromRequest = (data) => {
    const model = {};
    for (const field of REQUIRED_FIELDS) {
        model[field] = data[field];
    }
    for (const field of OPTIONAL_FIELDS) {
        model[field] = data[field];
    }
    return model;
};

/**
 * Receive feedback request and save to mongo
 *
 * @returns {Object}
 */
exports.submitFeedback = [
    async function (req, res) {
        const data = req.body || {};
        const model = parseModelFromRequest(data);

        // All values should be populated from the request
        for (const field of REQUIRED_FIELDS) {
            if (!model[field]) {
                logger.log(
                    'error',
                    `Request couldn't be parsed for all model values. Missing '${field}' in ${JSON.stringify(data).replace(
                        new RegExp('"', 'g'),
                        "'"
                    )}`
                );
                return apiResponse.ErrorResponse(res, `Invalid request. Must contain fields: ${REQUIRED_FIELDS.join(',')}`);
            }
        }

        const feedback = new FeedbackModel(model);
        let sent = false; // TODO - node will try to send the success AND error response unless we flag the success
        await feedback.save((err) => {
            const errMsg = `Failed to save to database: ${err}`;
            logger.log('error', errMsg);
            if (!sent) {
                sent = true;
                return apiResponse.ErrorResponse(res, 'Failed to save feedback');
            }
        });
        if (!sent) {
            logger.log('info', `Saved Feedback: ${model}`);
            sent = true;
            return apiResponse.successResponseWithData(res, 'Saved Feedback', { feedback: model });
        }
    },
];

exports.getFeedback = [
    async function (req, res) {
        try {
            const all = await FeedbackModel.find({});
            const feedback = all.map((entry) => {
                // Redact default fields added by mongo
                const resp = Object.assign(entry.toJSON());
                delete resp._id;
                delete resp.__v;
                delete resp.createdAt;
                delete resp.updatedAt;
                return resp;
            });
            return apiResponse.successResponseWithData(res, 'Saved Feedback', { feedback });
        } catch (err) {
            return apiResponse.ErrorResponse(res, 'Failed to save feedback');
        }
    },
];
