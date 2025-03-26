const express = require('express');
const router = express.Router();
const { saveJobListing, unsaveJobListing } = require('../controllers/saveJobListingController');
const { protect }  = require('../middleware/authMiddleware');

// Save a job
router.post('/:userId/saved/:jobId', protect, saveJobListing);

// Un‑save a job
router.delete('/:userId/saved/:jobId', protect, unsaveJobListing);

module.exports = router;
