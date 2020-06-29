var express = require("express");
const FeedbackController = require("../controllers/feedback-controller");
var router = express.Router();

router.get("/submitFeedback", FeedbackController.submitFeedback);

module.exports = router;
