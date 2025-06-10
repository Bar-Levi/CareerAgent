const express = require('express');
const { 
    createApplicant, 
    getApplicants, 
    getApplicantById, 
    updateApplicant, 
    deleteApplicant,
    getRecruiterApplicants,
    getJobSeekerApplicants,
    getActiveRecruiterApplicants,
    handleEmailUpdates
} = require('../controllers/applicantController');

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new applicant
router.post('/', protect, createApplicant);

// Get all applicants
router.get('/', protect, getApplicants);

// Get a specific applicant by ID
router.get('/:id', protect, getApplicantById);

// Get a specific applicant by ID
router.get('/getRecruiterApplicants/:recruiterId', protect, getRecruiterApplicants);

// Get active applicants (not Hired or Rejected) for a specific recruiter
router.get('/getActiveRecruiterApplicants/:recruiterId', protect, getActiveRecruiterApplicants);

// Get all applicants for a specific job seeker
router.get('/getJobSeekerApplications/:jobSeekerId', protect, getJobSeekerApplicants);

// Update a specific applicant by ID
router.put('/:id', protect, updateApplicant);

// Handle status-specific logic
router.post('/handleEmailUpdates', protect, handleEmailUpdates);

// Delete a specific applicant by ID
router.delete('/:id', protect, deleteApplicant);

module.exports = router;
