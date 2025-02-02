const express = require("express");
const router = express.Router();
const {
    getAllConversations,
    getConversationById,
    createConversation,
    updateConversation,
    deleteConversation,
    addMessageToConversation,
    updateMessageInConversation,
    deleteMessageFromConversation,
} = require("../controllers/conversationController");

// Routes for conversations
router.get("/", getAllConversations);
router.get("/:conversationId", getConversationById);
router.post("/", createConversation);
router.put("/:id", updateConversation);
router.delete("/:id", deleteConversation);

// Routes for messages within a conversation
router.post("/:id/messages", addMessageToConversation); // POST to add a new message
router.put("/:id/messages/:messageId", updateMessageInConversation); // PUT to update a message
router.delete("/:id/messages/:messageId", deleteMessageFromConversation); // DELETE to remove a message

module.exports = router;