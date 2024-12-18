const express = require('express');
const { 
    registerUser,
    verifyCode,
    loginUser,
    resendVerificationCode
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify', verifyCode); // New route to verify the code
router.post('/login', loginUser);
router.post('/resend', resendVerificationCode);



module.exports = router;
