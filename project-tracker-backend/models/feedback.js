var mongoose = require('mongoose');

const schemaModel = {
    subject: { type: String, default: '', required: true },
    body: { type: String, required: true },
    type: { type: String, required: true },
    project: { type: String, required: true },
};

var FeedbackSchema = new mongoose.Schema(schemaModel, { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } });

exports.mo;

module.exports = mongoose.model('Feedback', FeedbackSchema);
