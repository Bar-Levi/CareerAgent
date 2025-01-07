const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  conversationId: { type: String, required: true, unique: true},
  messages: { type: Array, default: [] }, // Array of messages
  type: { type: String, required: true},
  startDate: { type: Date, required: true}
});

module.exports = mongoose.model("Conversation", conversationSchema);