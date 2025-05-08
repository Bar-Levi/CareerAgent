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
const { generalLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Save a new Job Listing
router.post('/save', protect, generalLimiter, saveJobListing);

// Get all job listings
router.get("/", protect, generalLimiter, getAllJobListings);

// Get a single job listing by ID
router.get("/getJobListing/:id", protect, generalLimiter, getJobListingById);

// Get recruiter's all job listings by recruiter ID
router.get("/recruiter/:recruiterId", protect, generalLimiter, getJobListingsByRecruiterId);

// Update a job listing by ID
router.put("/:id", protect, generalLimiter, updateJobListing);

// Delete a job listing by ID
router.delete("/:id", protect, generalLimiter, deleteJobListing);

// Filter job listings
router.get("/filteredJobListings", protect, generalLimiter, filterActiveJobListings);

router.get("/metrics/:recruiterId", protect, generalLimiter, getMetrics);

router.get("/getRecruiterListings/:recruiterId", protect, generalLimiter, getRecruiterListings);


module.exports = router;
