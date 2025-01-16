const express = require('express');
const { 
    saveJobListing,
    getAllJobListings,
    getJobListingById,
    updateJobListing,
    deleteJobListing,
    getJobListingsByRecruiterId,
    filterJobListings
} = require('../controllers/jobListingController');

const router = express.Router();

// Save a new Job Listing
router.post('/save', saveJobListing);

// Get all job listings
router.get("/", getAllJobListings);

// Get a single job listing by ID
router.get("/getJobListing/:id", getJobListingById);

// Get recruiter's all job listings by recruiter ID
router.get("/recruiter/:recruiterId", getJobListingsByRecruiterId);

// Update a job listing by ID
router.put("/:id", updateJobListing);

// Delete a job listing by ID
router.delete("/:id", deleteJobListing);

// Filter job listings
router.get("/filteredJobListings", filterJobListings);


module.exports = router;
