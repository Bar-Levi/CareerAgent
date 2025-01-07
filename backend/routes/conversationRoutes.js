const express = require("express");
const {
  saveConversation,
  getConversations,
  createNewConversation,
  removeConversation,
  updateConversationTitle,
  saveMessageToConversation
} = require("../controllers/conversationController");

const router = express.Router();

// Save a conversation
router.post("/save", saveConversation);

// Get all conversations for a user
router.get("/", getConversations);

// Create a new conversation
router.post("/new", createNewConversation);

// Remove a conversation
router.delete("/:id", removeConversation); // Pass conversation ID in the route

// Update conversation title
router.put("/:id", updateConversationTitle); // Pass conversation ID in the route

router.post("/:id/messages", saveMessageToConversation); // Add a message to a conversation

module.exports = router;
