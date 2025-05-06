const express = require('express');
const { submitContactForm } = require('../controllers/contactController');

const {
    protect
  } = require("../middleware/authMiddleware");

const router = express.Router();

// Submit contact form
router.post('/', protect, submitContactForm);

module.exports = router; 