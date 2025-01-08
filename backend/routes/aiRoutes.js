const express = require("express");

const { 
    generateJsonFromCV,
    sendToBot,
 } = require("../controllers/aiController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generateJsonFromCV", protect, generateJsonFromCV);
router.post("/sendToBot", protect, sendToBot);


module.exports = router;