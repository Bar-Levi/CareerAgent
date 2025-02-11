const express = require('express');
const router = express.Router();
const { changePassword } = require('../controllers/personalDetailsController');
const { protect } = require('../middleware/authMiddleware'); // Your provided protect middleware

// Route to change password
router.post('/change-password', protect, changePassword);

module.exports = router;
