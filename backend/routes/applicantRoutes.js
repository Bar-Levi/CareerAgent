const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');

// Create a new applicant
router.post('/', applicantController.createApplicant);

// Get all applicants
router.get('/', applicantController.getAllApplicants);

// Get a single applicant by ID
router.get('/:id', applicantController.getApplicantById);

// Update an applicant
router.put('/:id', applicantController.updateApplicant);

// Delete an applicant
router.delete('/:id', applicantController.deleteApplicant);

module.exports = router;
