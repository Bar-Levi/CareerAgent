const express = require("express");

const { 
    generateJsonFromCV,
    sendToBot,
    analyzeJobListing,
    improveCV
 } = require("../controllers/aiController");

const { strictLimiter } = require("../middleware/rateLimiters");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generateJsonFromCV", strictLimiter, generateJsonFromCV);
router.post("/sendToBot", protect, strictLimiter, sendToBot);
router.post("/analyzeJobListing", protect, strictLimiter, analyzeJobListing);
router.post("/improveCV", protect, strictLimiter, improveCV);



module.exports = router;