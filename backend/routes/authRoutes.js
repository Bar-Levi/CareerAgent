const express = require("express");
const multer = require("multer");

const { protect } = require("../middleware/authMiddleware");
const { generalLimiter, strictLimiter } = require("../middleware/rateLimiters");

const {
  registerRecruiter,
  registerJobSeeker,
  verifyCode,
  loginUser,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  getUserDetails,
  resetLoginAttempts,
  uploadCV,
  logout,
  checkBlacklist,
  deleteNotification,
  deleteAllNotifications,
  markAsReadNotification,
  checkEmail,
  deleteUser,
} = require("../controllers/authController");

const router = express.Router();

// Multer configuration for CV uploads
const upload = multer({ dest: "uploads/" }); // Set your uploads folder

// Critical routes with strictLimiter
router.post("/registerJobSeeker", strictLimiter, registerJobSeeker);
router.post("/registerRecruiter", strictLimiter, registerRecruiter);
router.post("/verify", strictLimiter, verifyCode);
router.post("/login", strictLimiter, loginUser);
router.post("/resend", strictLimiter, resendVerificationCode);
router.post("/reset-login-attempts", strictLimiter, resetLoginAttempts);
router.post("/logout", protect, strictLimiter, logout);
router.post('/check-blacklist',strictLimiter, checkBlacklist);


// Less critical routes with generalLimiter
router.post("/request-password-reset", generalLimiter, requestPasswordReset);
router.post("/reset-password", protect, generalLimiter, resetPassword);
router.post("/check-email", generalLimiter, checkEmail);

// Protected route with generalLimiter
router.get("/user-details", protect, generalLimiter, getUserDetails);

// Route for CV upload
router.patch("/upload-cv/:id", protect, upload.single("cv"), uploadCV);

// Route for notifications
router.patch("/mark-as-read-notification/:userId/:notificationId", protect, generalLimiter, markAsReadNotification);
router.delete("/delete-notification/:userId/:notificationId", protect, generalLimiter, deleteNotification);
router.delete("/delete-all-notifications/:userId", protect, generalLimiter, deleteAllNotifications);

// Route for deleting user
router.delete("/delete-user/:userId/:userType", protect, generalLimiter, deleteUser);

module.exports = router;
