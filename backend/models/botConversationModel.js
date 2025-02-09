const mongoose = require("mongoose");

const botConversationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["careerAdvisor", "interviewer"], // Restrict allowed types
      required: true,
    },
    conversationId: {
      type: String,
      required: true,
    },
    conversationTitle: {
      type: String,
      required: true,
      default: "Untitled Conversation",
    },
    isProfileSynced: {
      type: Boolean,
      default: false,
      required: true,
    },
    messages: [
      {
        sender: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("BotConversation", botConversationSchema);
