const express = require("express");
const { 
    generateJsonFromCV,
    sendToCareerAdvisor,
    sendToInterviewer
 } = require("../controllers/aiController");

const router = express.Router();

router.post("/generateJsonFromCV", generateJsonFromCV);
router.post("/sendToCareerAdvisor", sendToCareerAdvisor);
router.post("/sendToInterviewer", sendToInterviewer);


module.exports = router;
