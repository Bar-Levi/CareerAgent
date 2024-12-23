const express = require('express');

const { 
    checkEmailExists,
    registerRecruiter,
    registerJobSeeker,
    verifyCode,
    loginUser,
    resendVerificationCode,
    requestPasswordReset, 
    resetPassword,
    getUserDetails
} = require('../controllers/authController');


const router = express.Router();

router.post('/registerJobSeeker', registerJobSeeker);
router.post('/registerRecruiter', registerRecruiter);
router.post('/verify', verifyCode); // New route to verify the code
router.post('/login', loginUser);
router.post('/resend', resendVerificationCode);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/check-email', checkEmailExists);

router.get('/user-details', getUserDetails);



module.exports = router;
