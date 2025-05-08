const express = require("express");
const {
  saveConversation,
  getConversations,
  createNewConversation,
  removeConversation,
  updateConversationTitle,
  saveMessageToConversation,
  getMessagesByConvId,
  toggleProfileSynced
} = require("../controllers/botConversationController");

const {
  protect
} = require("../middleware/authMiddleware");

const { generalLimiter, strictLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Save a conversation
router.post("/save", protect, strictLimiter, saveConversation);

// Get all conversations for a user
router.get("/", protect, strictLimiter, getConversations);

router.get("/getMessagesByConvId", protect, strictLimiter, getMessagesByConvId);

// Create a new conversation
router.post("/new", protect, strictLimiter, createNewConversation);

// Remove a conversation
router.delete("/:id", protect, generalLimiter, removeConversation); // Pass conversation ID in the route

// Update conversation title
router.put("/:id", protect, generalLimiter, updateConversationTitle); // Pass conversation ID in the route

router.put("/:id/toggleProfileSynced", protect, strictLimiter, toggleProfileSynced); // Pass conversation

router.post("/:id/messages", protect, strictLimiter, saveMessageToConversation); // Add a message to a conversation

module.exports = router;
