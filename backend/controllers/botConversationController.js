const BotConversation = require("../models/botConversationModel");

// Save a conversation
const saveConversation = async (req, res) => {
  const { email, conversationId, messages } = req.body;

  try {
    const newConversation = await BotConversation.create({ email, conversationId, messages });
    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversations for a user
const getConversations = async (req, res) => {
  const email = req.query.email;

  try {
    const conversations = await BotConversation.find({ email });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversations for a user
const getMessagesByConvId = async (req, res) => {
  const conversationId = req.query.convId;


  try {
    const conversation = await BotConversation.find({ conversationId });

    res.status(200).json(conversation[0].messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new conversation
const createNewConversation = async (req, res) => {
  const { email, type, jobData } = req.body;
  try {
    // Generate a conversationId based on type and current time
    const conversationId = `${type}-${Date.now()}`;

    const conversations = await BotConversation.find({ email, type });

    if (conversations.length < 10) {
      // Build the new conversation data object.
      const newConversationData = {
        email,
        type,
        conversationId,
        messages: [],
        startDate: new Date(),
        jobData: jobData || null,
      };

    // If jobData is provided, include a conversationTitle based on it.
    if (jobData && Object.keys(jobData).length > 0) {
      if (jobData.jobRole) {
        newConversationData.conversationTitle = jobData.recruiterName
          ? `Interview for ${jobData.jobRole}. Recruiter: ${jobData.recruiterName}`
          : `Interview for ${jobData.jobRole}`;
      } else {
        newConversationData.conversationTitle = "Interview Conversation";
      }
    }

      
      const newConversation = await BotConversation.create(newConversationData);

      // No need to call save() explicitly as create() already persists the document.
      res.status(201).json(newConversation);
    } else {
      const name = type === "interviewer" ? type : "career advisor";
      return res.status(400).json({
        message: `You have reached the maximum number of ${name} conversations. Remove some and try again.`,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Remove a conversation
const removeConversation = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedConversation = await BotConversation.findByIdAndDelete(id);

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
  const { conversationTitle } = req.body; // New title
  try {
    const updatedConversation = await BotConversation.findByIdAndUpdate(
      id,
      { conversationTitle },
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
  const MAX_MESSAGE_COUNT = 100;
  const { id } = req.params; // Conversation ID
  const { message } = req.body; // New message object
  try {
    const conversation = await BotConversation.findById(id);

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

// Toggle isProfileSynced
const toggleProfileSynced = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Find the conversation by ID
    const conversation = await BotConversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Reverse the isProfileSynced value
    const updatedConversation = await BotConversation.findByIdAndUpdate(
      id,
      { isProfileSynced: !conversation.isProfileSynced },
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedConversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  saveConversation,
  getConversations,
  createNewConversation,
  removeConversation,
  updateConversationTitle,
  saveMessageToConversation,
  getMessagesByConvId,
  toggleProfileSynced
};
