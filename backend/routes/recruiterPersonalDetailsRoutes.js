const express = require('express');
const router = express.Router();
const {  
  updateRecruiterPersonalDetails,
  resetRecruiterPersonalDetails
} = require('../controllers/recruiterPersonalDetailsController');
const { protect } = require('../middleware/authMiddleware');
const { generalLimiter } = require('../middleware/rateLimiters');

// Route to update recruiter personal details (e.g. dob or company website)
router.post('/update-recruiter-details', protect, generalLimiter, updateRecruiterPersonalDetails);

// Route to reset recruiter personal details (e.g. set dob to null or company website to empty string)
router.post('/reset-recruiter-details', protect, generalLimiter, resetRecruiterPersonalDetails);

module.exports = router;
