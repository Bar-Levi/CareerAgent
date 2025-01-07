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

// Create a new conversation
const createNewConversation = async (req, res) => {
  const { email, type } = req.body;
  console.log("BACKEND - Creating a new conversation for type: " + type +" and email: " + email );
  try {
    // Generate a conversationId based on type and current time
    const conversationId = `${type}-${Date.now()}`;

    // Initialize an empty messages array
    const newConversation = await Conversation.create({
      email,
      type,
      conversationId,
      messages: [],
      startDate: new Date(),
    });

    newConversation.save();

    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a conversation
const removeConversation = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedConversation = await Conversation.findByIdAndDelete(id);

    if (!deletedConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update conversation title
const updateConversationTitle = async (req, res) => {
  const { id } = req.params;
  const { conversationId } = req.body; // New title

  try {
    const updatedConversation = await Conversation.findByIdAndUpdate(
      id,
      { conversationId },
      { new: true } // Return the updated document
    );

    if (!updatedConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json(updatedConversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveMessageToConversation = async (req, res) => {
  const MAX_MESSAGE_COUNT = 4;
  const { id } = req.params; // Conversation ID
  const { message } = req.body; // New message object

  try {
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if the conversation already has 4 messages
    if (conversation.messages.length >= MAX_MESSAGE_COUNT) {
      return res.status(400).json({
        error: `This conversation already has ${MAX_MESSAGE_COUNT} messages. Please start a new conversation.`,
      });
    }

    // Add the new message to the messages array
    conversation.messages.push(message);

    // Save the updated conversation
    await conversation.save();

    res.status(200).json({ message: "Message saved successfully" });
  } catch (error) {
    console.error("Error saving message:", error.message);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  saveConversation,
  getConversations,
  createNewConversation,
  removeConversation,
  updateConversationTitle,
  saveMessageToConversation
};
