const express = require('express');
const { protect } = require('../middleware/authMiddleware');


const { 
    registerRecruiter,
    registerJobSeeker,
    verifyCode,
    loginUser,
    resendVerificationCode,
    requestPasswordReset, 
    resetPassword,
    getUserDetails,
    getUserLoginAttempts,
    resetUserLoginAttempts
} = require('../controllers/authController');


const router = express.Router();

router.post('/registerJobSeeker', registerJobSeeker);
router.post('/registerRecruiter', registerRecruiter);
router.post('/verify', verifyCode);
router.post('/login', loginUser);
router.post('/resend', resendVerificationCode);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/reset-user-login-attempts', resetUserLoginAttempts);


router.get('/user-details', protect, getUserDetails);
router.get('/user-login-attempts', getUserLoginAttempts);




module.exports = router;
