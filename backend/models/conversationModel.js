const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
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

module.exports = mongoose.model("Conversation", conversationSchema);
