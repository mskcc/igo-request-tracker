var express = require("express");
const LimsController = require("../controllers/lims-controller");
var router = express.Router();

router.get("/", LimsController.getProjects);
router.get("/:id", LimsController.getProjectTrackingData);

module.exports = router;
