const express = require("express");
const router = express.Router();
const { saveConversation, getConversations } = require("../controllers/conversationController");

// Save a new conversation
router.post("/save", saveConversation);

// Get all conversations for a user
router.get("/", getConversations);

module.exports = router;
