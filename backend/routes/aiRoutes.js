const express = require("express");
const { 
    generateJsonFromCV,
    sendToCareerAdvisor
 } = require("../controllers/aiController");

const router = express.Router();

router.post("/generateJsonFromCV", generateJsonFromCV);
router.post("/sendToCareerAdvisor", sendToCareerAdvisor);

module.exports = router;
