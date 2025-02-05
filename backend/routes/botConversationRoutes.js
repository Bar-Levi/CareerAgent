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

const router = express.Router();

// Save a conversation
router.post("/save", protect, saveConversation);

// Get all conversations for a user
router.get("/", protect, getConversations);

router.get("/getMessagesByConvId", protect, getMessagesByConvId);

// Create a new conversation
router.post("/new", protect, createNewConversation);

// Remove a conversation
router.delete("/:id", protect, removeConversation); // Pass conversation ID in the route

// Update conversation title
router.put("/:id", protect, updateConversationTitle); // Pass conversation ID in the route

router.put("/:id/toggleProfileSynced", protect, toggleProfileSynced); // Pass conversation

router.post("/:id/messages", protect, saveMessageToConversation); // Add a message to a conversation

module.exports = router;
