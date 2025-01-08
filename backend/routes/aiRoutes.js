const express = require("express");
const { 
    generateJsonFromCV,
    sendToBot,
 } = require("../controllers/aiController");

const router = express.Router();

router.post("/generateJsonFromCV", generateJsonFromCV);
router.post("/sendToBot", sendToBot);


module.exports = router;
