const Conversation = require("../models/conversationModel");

// Save a conversation
const saveConversation = async (req, res) => {
  const { email, conversationId, messages } = req.body;

  try {
    const newConversation = await Conversation.create({ email, conversationId, messages });
    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversations for a user
const getConversations = async (req, res) => {
  const email = req.query.email;
  try {
    const conversations = await Conversation.find({ email });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { saveConversation, getConversations };