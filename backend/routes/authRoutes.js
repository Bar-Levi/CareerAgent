const express = require('express');
const { 
    registerUser,
    verifyCode,
    loginUser,
    resendVerificationCode,
    requestPasswordReset, 
    resetPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify', verifyCode); // New route to verify the code
router.post('/login', loginUser);
router.post('/resend', resendVerificationCode);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);




module.exports = router;
