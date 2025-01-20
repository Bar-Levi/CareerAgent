const express = require('express');
const { 
    createApplicant, 
    getApplicants, 
    getApplicantById, 
    updateApplicant, 
    deleteApplicant,
    getRecruiterApplicants
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

// Update a specific applicant by ID
router.put('/:id', protect, updateApplicant);

// Delete a specific applicant by ID
router.delete('/:id', protect, deleteApplicant);

module.exports = router;
