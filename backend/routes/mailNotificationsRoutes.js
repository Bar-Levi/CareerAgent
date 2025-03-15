const express = require("express");
const unsubscribeUser = require("../controllers/mailNotificationsController");
const { generalLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Unsubscribe user from email notifications
router.post('/unsubscribe', generalLimiter, unsubscribeUser);

module.exports = router;
