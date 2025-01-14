const express = require("express");

const { 
    generateJsonFromCV,
    sendToBot,
    analyzeJobListing
 } = require("../controllers/aiController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generateJsonFromCV", generateJsonFromCV);
router.post("/sendToBot", protect, sendToBot);
router.post("/analyzeJobListing", analyzeJobListing);



module.exports = router;