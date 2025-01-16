const express = require('express');
const { 
    createApplicant, 
    getApplicants, 
    getApplicantById, 
    updateApplicant, 
    deleteApplicant 
} = require('../controllers/applicantController');

const router = express.Router();

// Create a new applicant
router.post('/', createApplicant);

// Get all applicants
router.get('/', getApplicants);

// Get a specific applicant by ID
router.get('/:id', getApplicantById);

// Update a specific applicant by ID
router.put('/:id', updateApplicant);

// Delete a specific applicant by ID
router.delete('/:id', deleteApplicant);

module.exports = router;
