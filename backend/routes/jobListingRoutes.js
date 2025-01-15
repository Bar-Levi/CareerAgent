const express = require('express');
const { 
    saveJobListing,
    getAllJobListings,
    getJobListingById,
    updateJobListing,
    deleteJobListing,
} = require('../controllers/jobListingController');

const router = express.Router();

// Save a new Job Listing
router.post('/save', saveJobListing);

// Get all job listings
router.get("/", getAllJobListings);

// Get a single job listing by ID
router.get("/:id", getJobListingById);

// Update a job listing by ID
router.put("/:id", updateJobListing);

// Delete a job listing by ID
router.delete("/:id", deleteJobListing);

module.exports = router;
