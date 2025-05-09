const express = require('express');
const router = express.Router();
const { saveJobListing, unsaveJobListing, getSavedJobListings } = require('../controllers/saveJobListingController');
const { protect }  = require('../middleware/authMiddleware');

// Save a job
router.post('/:userId/saved/:jobId', protect, saveJobListing);

// Un‑save a job
router.delete('/:userId/saved/:jobId', protect, unsaveJobListing);

// Get saved jobs by user ID
router.get('/:userId/saved', protect, getSavedJobListings);

module.exports = router;
