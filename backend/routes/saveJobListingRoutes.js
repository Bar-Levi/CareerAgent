const express = require('express');
const router = express.Router();
const { saveJobListing, unsaveJobListing, getSavedJobListings, getSavedJobListingsByEmail } = require('../controllers/saveJobListingController');
const { protect }  = require('../middleware/authMiddleware');

// Save a job
router.post('/:userId/saved/:jobId', protect, saveJobListing);

// Un‑save a job
router.delete('/:userId/saved/:jobId', protect, unsaveJobListing);

// Get saved jobs by user ID
router.get('/:userId/saved', protect, getSavedJobListings);

// Get saved jobs by email
router.get('/email/:email/saved', protect, getSavedJobListingsByEmail);

module.exports = router;
