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


// CV Endpoints for jobseeker
router.post("/jobseeker/cv/update", protect, uploadCVMiddleware, updateCV);
router.delete("/jobseeker/cv/delete", protect, deleteCV);
router.get("/jobseeker/cv-content", protect, getCVContent);

// Route to change password
router.post('/change-password', protect, changePassword);

router.post('/change-pic', upload.single('file'), changePic);
router.delete('/change-pic', changePic);

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

// Route to update current jobSeeker personal details
router.post('/update-job-seeker-details', protect, updateJobSeekerPersonalDetails);

// Route to reset current jobSeeker personal details
router.post('/reset-job-seeker-details', protect, resetJobSeekerPersonalDetails);

// Route to subscribe or unsubscribe from email notifications
router.put('/subscribeOrUnsubscribe', protect, subscribeOrUnsubscribe);

// Route to get job seeker statistics
router.get('/statistics', protect, getJobSeekerStatistics);

module.exports = router;
