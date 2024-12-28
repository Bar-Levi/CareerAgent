const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generalLimiter, strictLimiter } = require('../middleware/rateLimiters');

const { 
    registerRecruiter,
    registerJobSeeker,
    verifyCode,
    loginUser,
    resendVerificationCode,
    requestPasswordReset, 
    resetPassword,
    getUserDetails,
    resetLoginAttempts
} = require('../controllers/authController');

const router = express.Router();

// Apply strictLimiter to critical routes
router.post('/registerJobSeeker', strictLimiter, registerJobSeeker);
router.post('/registerRecruiter', strictLimiter, registerRecruiter);
router.post('/verify', strictLimiter, verifyCode);
router.post('/login', strictLimiter, loginUser);
router.post('/resend', strictLimiter, resendVerificationCode);
router.post('/reset-login-attempts', strictLimiter, resetLoginAttempts);

// Apply generalLimiter to less critical routes
router.post('/request-password-reset', generalLimiter, requestPasswordReset);
router.post('/reset-password', generalLimiter, resetPassword);

// Protected routes with generalLimiter
router.get('/user-details', protect, generalLimiter, getUserDetails);


module.exports = router;
