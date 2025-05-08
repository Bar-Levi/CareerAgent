const express = require('express');
const router = express.Router();
const {
    deleteCV,
    changePassword,
    changePic,
    getNameAndProfilePic, updateJobSeekerPersonalDetails, resetJobSeekerPersonalDetails,
    uploadCVMiddleware,
    updateCV,
    getRelevancePoints,
    setRelevancePoints,
    getMinPointsForUpdate,
    setMinPointsForUpdate,
    subscribeOrUnsubscribe,
    getJobSeekerStatistics,
    getCVContent,
 } = require('../controllers/jobSeekerPersonalDetailsController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { generalLimiter } = require("../middleware/rateLimiters");


// CV Endpoints for jobseeker
router.post("/jobseeker/cv/update", protect, generalLimiter, uploadCVMiddleware, updateCV);
router.delete("/jobseeker/cv/delete", protect, generalLimiter, deleteCV);
router.get("/jobseeker/cv-content", protect, generalLimiter, getCVContent);

// Route to change password
router.post('/change-password', protect, generalLimiter, changePassword);

router.post('/change-pic', generalLimiter, upload.single('file'), changePic);
router.delete('/change-pic', generalLimiter, changePic);

// Route to Get current profile picture
router.get('/name-and-profile-pic', protect, generalLimiter, getNameAndProfilePic);

// Route to get current relevance points
router.get('/relevance-points', protect, generalLimiter, getRelevancePoints);

// Route to set current relevance points
router.post('/set-relevance-points', protect, generalLimiter, setRelevancePoints);

// Route to get current relevance points
router.get('/min-points-for-update', protect, generalLimiter, getMinPointsForUpdate);

// Route to set current relevance points
router.post('/set-min-points-for-update', protect, generalLimiter, setMinPointsForUpdate);

// Route to update current jobSeeker personal details
router.post('/update-job-seeker-details', protect, generalLimiter, updateJobSeekerPersonalDetails);

// Route to reset current jobSeeker personal details
router.post('/reset-job-seeker-details', protect, generalLimiter, resetJobSeekerPersonalDetails);

// Route to subscribe or unsubscribe from email notifications
router.put('/subscribeOrUnsubscribe', protect, generalLimiter, subscribeOrUnsubscribe);

// Route to get job seeker statistics
router.get('/statistics', protect, generalLimiter, getJobSeekerStatistics);

module.exports = router;
