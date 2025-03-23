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
    getJobListingConversations,
    markMessagesAsRead,
    getConversationByJobCandidateId
} = require("../controllers/conversationController");
const { protect } = require("../middleware/authMiddleware");

// Routes for conversations
router.get("/", protect, getAllConversations);
router.get("/:conversationId", protect, getConversationById);
router.post("/", protect, createConversation);
router.put("/:id", protect, updateConversation);
router.delete("/:id", protect, deleteConversation);

// Mark messages as read
router.patch("/:conversationId/markAsRead", protect, markMessagesAsRead);


// Get conversations of a specific jobListing
router.get("/jobListing/:jobListingId", protect, getJobListingConversations);

// Get conversation of a specific user
router.get("/getJobCandidateConversations/:userId", getConversationByJobCandidateId);

// Routes for messages within a conversation
router.post("/:id/messages", protect, addMessageToConversation); // POST to add a new message
router.put("/:id/messages/:messageId", protect, updateMessageInConversation); // PUT to update a message
router.delete("/:id/messages/:messageId", protect, deleteMessageFromConversation); // DELETE to remove a message

module.exports = router;