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
    getConversationByJobCandidateId,
    getJobListingIdByConversationId,
    hideConversation
} = require("../controllers/conversationController");
const { generalLimiter } = require("../middleware/rateLimiters");
const { protect } = require("../middleware/authMiddleware");

// Routes for conversations
router.get("/", protect, getAllConversations);
router.get("/:conversationId", protect, getConversationById);
router.post("/", protect, createConversation);
router.put("/:id", protect, updateConversation);
router.delete("/:id", protect, deleteConversation);

// Mark messages as read
router.patch("/:conversationId/markAsRead", protect, generalLimiter, markMessagesAsRead);

router.patch("/:convId/hide", protect, generalLimiter, hideConversation);


// Get conversations of a specific jobListing
router.get("/jobListing/:jobListingId", protect, generalLimiter, getJobListingConversations);

// Get jobListingId by conversationId
router.get("/jobListingId/:conversationId", protect, generalLimiter, getJobListingIdByConversationId);

// Get conversation of a specific user
router.get("/getJobCandidateConversations/:userId", generalLimiter, getConversationByJobCandidateId);

// Routes for messages within a conversation
router.post("/:id/messages", protect, generalLimiter, addMessageToConversation); // POST to add a new message
router.put("/:id/messages/:messageId", protect, generalLimiter, updateMessageInConversation); // PUT to update a message
router.delete("/:id/messages/:messageId", protect, generalLimiter, deleteMessageFromConversation); // DELETE to remove a message

module.exports = router;