const express = require('express');
const router = express.Router();
const { 
  getRecruiterPersonalDetails, 
  updateRecruiterPersonalDetails 
} = require('../controllers/recruiterPersonalDetailsController');
const { protect } = require('../middleware/authMiddleware');

// Route to get recruiter personal details by email and (optionally) type
router.get('/recruiter-details', protect, getRecruiterPersonalDetails);

// Route to update recruiter personal details (e.g. dob or company website)
router.post('/update-recruiter-details', protect, updateRecruiterPersonalDetails);

module.exports = router;
