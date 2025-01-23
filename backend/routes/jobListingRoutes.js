const express = require('express');
const { 
    saveJobListing,
    getAllJobListings,
    getJobListingById,
    updateJobListing,
    deleteJobListing,
    getJobListingsByRecruiterId,
    filterActiveJobListings,
    getMetrics,
    getRecruiterListings
} = require('../controllers/jobListingController');

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

// Save a new Job Listing
router.post('/save', protect, saveJobListing);

// Get all job listings
router.get("/", protect, getAllJobListings);

// Get a single job listing by ID
router.get("/getJobListing/:id", protect, getJobListingById);

// Get recruiter's all job listings by recruiter ID
router.get("/recruiter/:recruiterId", protect, getJobListingsByRecruiterId);

// Update a job listing by ID
router.put("/:id", protect, updateJobListing);

// Delete a job listing by ID
router.delete("/:id", protect, deleteJobListing);

// Filter job listings
router.get("/filteredJobListings", protect, filterActiveJobListings);

router.get("/metrics/:recruiterId", protect, getMetrics);

router.get("/getRecruiterListings/:recruiterId", protect, getRecruiterListings);


module.exports = router;
