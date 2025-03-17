const express = require('express');
const router = express.Router();
const {
    deleteCV,
    changePassword,
    changeProfilePic,
    deleteProfilePic,
    getNameAndProfilePic,getJobSeekerPersonalDetails,updateJobSeekerPersonalDetails,resetJobSeekerPersonalDetails,
    getCV,
    uploadCVMiddleware,
    updateCV,
    getRelevancePoints,
    setRelevancePoints,
    getMinPointsForUpdate,
    setMinPointsForUpdate,
    subscribeOrUnsubscribe,
 } = require('../controllers/jobSeekerPersonalDetailsController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


// CV Endpoints for jobseeker
router.get("/jobseeker/cv", protect, getCV);
router.post("/jobseeker/cv/update", protect, uploadCVMiddleware, updateCV);
router.delete("/jobseeker/cv/delete", protect, deleteCV);

// Route to change password
router.post('/change-password', protect, changePassword);

// Route for changing profile picture (expects a file in req.file)
router.post('/change-profile-pic', protect, upload.single('file'), changeProfilePic);

// Route to delete (revert) profile picture to default
router.delete('/profile-pic', protect, deleteProfilePic);

// Route to Get current profile picture
router.get('/name-and-profile-pic', protect, getNameAndProfilePic);

// Route to get current relevance points
router.get('/relevance-points', protect, getRelevancePoints);

// Route to set current relevance points
router.post('/set-relevance-points', protect, setRelevancePoints);

// Route to get current relevance points
router.get('/min-points-for-update', protect, getMinPointsForUpdate);

// Route to set current relevance points
router.post('/set-min-points-for-update', protect, setMinPointsForUpdate);

// Route to Get current jobSeeker personal details
router.get('/job-seeker-details', protect, getJobSeekerPersonalDetails);

// Route to update current jobSeeker personal details
router.post('/update-job-seeker-details', protect, updateJobSeekerPersonalDetails);

// Route to reset current jobSeeker personal details
router.post('/reset-job-seeker-details', protect, resetJobSeekerPersonalDetails);

// Route to subscribe or unsubscribe from email notifications
router.put('/subscribeOrUnsubscribe', protect, subscribeOrUnsubscribe);

module.exports = router;
