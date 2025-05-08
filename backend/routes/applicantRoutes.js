const express = require('express');
const { 
    createApplicant, 
    getApplicants, 
    getApplicantById, 
    updateApplicant, 
    deleteApplicant,
    getRecruiterApplicants,
    getJobSeekerApplicants,
    handleEmailUpdates
} = require('../controllers/applicantController');

const {
    protect
} = require("../middleware/authMiddleware");

const { generalLimiter, strictLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Create a new applicant
router.post('/', protect, generalLimiter, createApplicant);

// Get all applicants
router.get('/', protect, strictLimiter, getApplicants);

// Get a specific applicant by ID
router.get('/:id', protect, strictLimiter, getApplicantById);

// Get a specific applicant by ID
router.get('/getRecruiterApplicants/:recruiterId', protect, strictLimiter, getRecruiterApplicants);

// Get all applicants for a specific job seeker
router.get('/getJobSeekerApplications/:jobSeekerId', protect, strictLimiter, getJobSeekerApplicants);

// Update a specific applicant by ID
router.put('/:id', protect, generalLimiter, updateApplicant);

// Handle status-specific logic
router.post('/handleEmailUpdates', protect, generalLimiter, handleEmailUpdates);

// Delete a specific applicant by ID
router.delete('/:id', protect, strictLimiter, deleteApplicant);

module.exports = router;
