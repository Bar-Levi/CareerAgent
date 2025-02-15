const express = require('express');
const router = express.Router();
const { changePassword, changeProfilePic, deleteProfilePic, getProfilePic,getJobSeekerPersonalDetails,updateJobSeekerPersonalDetails } = require('../controllers/personalDetailsController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


// Route to change password
router.post('/change-password', protect, changePassword);

// Route for changing profile picture (expects a file in req.file)
router.post('/change-profile-pic', protect, upload.single('file'), changeProfilePic);

// Route to delete (revert) profile picture to default
router.delete('/profile-pic', protect, deleteProfilePic);

// Route to Get current profile picture
router.get('/profile-pic', protect, getProfilePic);

// Route to Get current jobSeeker personal details
router.get('/job-seeker-details', protect, getJobSeekerPersonalDetails);

// Route to update current jobSeeker personal details
router.post('/update-job-seeker-details', protect, updateJobSeekerPersonalDetails);

module.exports = router;
