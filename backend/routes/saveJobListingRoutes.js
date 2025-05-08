const express = require('express');
const router = express.Router();
const { saveJobListing, unsaveJobListing } = require('../controllers/saveJobListingController');
const { protect }  = require('../middleware/authMiddleware');
const { generalLimiter } = require('../middleware/rateLimiters');

// Save a job
router.post('/:userId/saved/:jobId', protect, generalLimiter, saveJobListing);

// Un‑save a job
router.delete('/:userId/saved/:jobId', protect, generalLimiter, unsaveJobListing);

module.exports = router;
