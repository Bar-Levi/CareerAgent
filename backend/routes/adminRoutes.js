const express = require('express');
const rateLimit = require('express-rate-limit');
const c = require('../controllers/adminController');
const { deleteUser } = require('../controllers/authController');
const { adminProtect } = require('../middleware/adminAuth');

const limiter = (windowMs, limit) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many requests. Try again later.' },
    });

const router = express.Router();

// Per IP. The per-account lockout lives in the controller.
router.post('/login', limiter(15 * 60 * 1000, 10), c.login);
router.post('/verify-otp', limiter(15 * 60 * 1000, 10), c.verifyOtp);
router.post('/resend-otp', limiter(15 * 60 * 1000, 5), c.resendOtp);

router.use(adminProtect, limiter(60 * 1000, 120));
router.post('/logout', c.logout);
router.get('/me', c.me);
router.get('/overview', c.overview);
router.get('/jobseekers', c.listJobSeekers);
router.get('/recruiters', c.listRecruiters);
router.delete('/users/:userType/:userId', deleteUser);

module.exports = router;
