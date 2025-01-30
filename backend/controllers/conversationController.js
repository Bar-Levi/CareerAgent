const Conversation = require("../models/conversationModel");
const { populate } = require("../models/conversationModel");

// Controller functions for conversations
const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find().populate("participants");
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate("participants").populate({
      path: 'messages',
      populate: {
        path: 'sender',
        model: 'User'
      }
    });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createConversation = async (req, res) => {
  const conversation = new Conversation(req.body); // Assuming req.body has the necessary data
  try {
    const newConversation = await conversation.save();
    res.status(201).json(newConversation); // 201 Created status code
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateConversation = async (req, res) => {
  try {
    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    ).populate("participants");
    if (!updatedConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.json(updatedConversation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const deletedConversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!deletedConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.status(204).end(); // 204 No Content status code for successful deletion
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Controller functions for messages within a conversation
const addMessageToConversation = async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
  
      const newMessage = req.body; // Assuming req.body contains the message data
      conversation.messages.push(newMessage);
      conversation.lastMessage = newMessage; // Update last message
      await conversation.save();
  
      const updatedConversation = await Conversation.findById(req.params.id).populate("participants").populate({
        path: 'messages',
        populate: {
          path: 'sender',
          model: 'User'
        }
      });
      res.status(201).json(updatedConversation); // 201 Created
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  const updateMessageInConversation = async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
  
      const messageId = req.params.messageId;
      const updatedMessage = req.body;
  
      const messageIndex = conversation.messages.findIndex(
        (message) => message._id.toString() === messageId
      );
  
      if (messageIndex === -1) {
        return res.status(404).json({ message: "Message not found" });
      }
  
      conversation.messages[messageIndex] = { ...conversation.messages[messageIndex], ...updatedMessage };
      await conversation.save();
      const updatedConversation = await Conversation.findById(req.params.id).populate("participants").populate({
        path: 'messages',
        populate: {
          path: 'sender',
          model: 'User'
        }
      });
      res.json(updatedConversation);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  const deleteMessageFromConversation = async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
  
      const messageId = req.params.messageId;
      conversation.messages = conversation.messages.filter(
        (message) => message._id.toString() !== messageId
      );
      await conversation.save();
      const updatedConversation = await Conversation.findById(req.params.id).populate("participants").populate({
        path: 'messages',
        populate: {
          path: 'sender',
          model: 'User'
        }
      });
      res.status(204).json(updatedConversation); // 204 No Content
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

module.exports = {
  getAllConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  addMessageToConversation,
  updateMessageInConversation,
  deleteMessageFromConversation
};
