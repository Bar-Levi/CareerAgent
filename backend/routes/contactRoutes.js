const express = require('express');
const { submitContactForm } = require('../controllers/contactController');
const { generalLimiter } = require("../middleware/rateLimiters");

const {
    protect
  } = require("../middleware/authMiddleware");

const router = express.Router();

// Submit contact form
router.post('/', protect, generalLimiter, submitContactForm);

module.exports = router; 