var express = require('express');
const FeedbackController = require('../controllers/feedback-controller');
var router = express.Router();

router.post('/submit', FeedbackController.submitFeedback);
router.get('/get', FeedbackController.getFeedback);

module.exports = router;
