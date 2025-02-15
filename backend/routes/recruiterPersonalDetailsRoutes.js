const express = require('express');
const router = express.Router();
const { 
  getRecruiterPersonalDetails, 
  updateRecruiterPersonalDetails,
  resetRecruiterPersonalDetails
} = require('../controllers/recruiterPersonalDetailsController');
const { protect } = require('../middleware/authMiddleware');

// Route to get recruiter personal details by email and type
router.get('/recruiter-details', protect, getRecruiterPersonalDetails);

// Route to update recruiter personal details (e.g. dob or company website)
router.post('/update-recruiter-details', protect, updateRecruiterPersonalDetails);

// Route to reset recruiter personal details (e.g. set dob to null or company website to empty string)
router.post('/reset-recruiter-details', protect, resetRecruiterPersonalDetails);

module.exports = router;
