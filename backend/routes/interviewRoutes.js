const express = require("express");
const router = express.Router();
const {
  scheduleInterview,
  getInterviewById,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, scheduleInterview);
router.get("/:id", protect, getInterviewById);
router.put("/:id", protect, updateInterview);
router.delete("/:id", protect, deleteInterview);

module.exports = router;
