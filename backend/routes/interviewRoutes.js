const express = require("express");
const router = express.Router();
const {
  scheduleInterview,
  getInterviewById,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");
const { generalLimiter } = require("../middleware/rateLimiters");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, generalLimiter, scheduleInterview);
router.get("/:id", protect, generalLimiter, getInterviewById);
router.put("/:id", protect, generalLimiter, updateInterview);
router.delete("/:id", protect, generalLimiter, deleteInterview);

module.exports = router;
