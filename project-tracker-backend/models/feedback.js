var mongoose = require("mongoose");

var FeedbackSchema = new mongoose.Schema(
	{
		subject: { type: String, default: "", required: true },
		body: { type: String, required: true },
		type: { type: String, required: true },
		project: { type: String, required: true }
	},
	{ timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } });

module.exports = mongoose.model("Feedback", FeedbackSchema);
