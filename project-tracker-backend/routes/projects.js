var express = require('express');
const LimsController = require('../controllers/lims-controller');
var router = express.Router();

router.get('/delivered', LimsController.getDeliveredProjects);
router.get('/undelivered', LimsController.getUndeliveredProjects);
router.get('/:id', LimsController.getProjectTrackingData);

module.exports = router;
