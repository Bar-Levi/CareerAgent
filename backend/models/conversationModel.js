const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId, // Store the user's ObjectId
      ref: "User", // Reference the User model
      required: true,
    },
    senderProfilePic: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    // Add other message-related fields as needed (attachments, reactions, etc.)
    attachments: [{
      url: String,
      type: String, // MIME type
      name: String
    }],
    reactions: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reactionType: String // e.g., "like", "heart"
    }],
    edited: {
      type: Boolean,
      default: false
    },
    deleted: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true } // Add timestamps to messages
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobSeeker", // Reference the User model
        required: true,
      },
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter", // Reference the User model
        required: true,
      },
    ],
    jobListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobListing",
      required: true,
    },
    messages: [messageSchema], // Use the messageSchema as a subdocument array
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupChatName: {
      type: String,
      required: function() { return this.isGroupChat; } // Only required if it's a group chat
    },
    // Add other conversation fields as needed (e.g., last message, etc.)
    lastMessage: {
      type: messageSchema,
      required: false
    }
  },
  { timestamps: true } // Add timestamps to the conversation
);

module.exports = mongoose.model("Conversation", conversationSchema);