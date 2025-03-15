const mongoose = require("mongoose");


const attachmentSchema = new mongoose.Schema({
  url: String,
  type: String,
  name: String,
});

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
    },
    senderName: {
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
    attachments: [attachmentSchema],
    read: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'participants.role'
  },
  name: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["JobSeeker", "Recruiter"], 
    required: true,
  },
});


const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [participantSchema],
      validate: {
        validator: function (arr) {
          return arr.length === 2; // if you only allow exactly two participants
        },
        message: "There must be exactly 2 participants in a conversation.",
      },
    },
    jobListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobListing",
      required: true,
    },
    jobListingRole: {
      type: String,
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

conversationSchema.index({ "participants.1": 1 });
module.exports = mongoose.model("Conversation", conversationSchema);