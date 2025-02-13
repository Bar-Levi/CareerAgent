const Conversation = require("../models/conversationModel");
const Recruiter = require("../models/recruiterModel");
const JobSeeker = require("../models/jobSeekerModel");
const JobListing = require("../models/jobListingModel");

// Controller functions for conversations
const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate("participants")
      .populate("jobListingId");
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConversationById = async (req, res) => {
  try {

    const conversation = await Conversation.findById(req.params.conversationId)
      .populate("participants")
      .populate("jobListingId")
      .populate("messages"); // No direct ref, fetching manually later

    if (!conversation) {
      
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json(conversation);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ message: "Server error while fetching conversation" });
  }
};

const createConversation = async (req, res) => {
  const { participants, jobListingId, isGroupChat, groupChatName } = req.body;

  if (!jobListingId) {
    return res.status(400).json({ message: "jobListingId is required" });
  }

  try {
    // Check if a conversation with the same participants and jobListingId already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length },
      jobListingId,
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // If no existing conversation is found, create a new one
    const conversation = new Conversation(req.body);
    const newConversation = await conversation.save();
    res.status(201).json(newConversation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateConversation = async (req, res) => {
  try {
    const { jobListingId, ...updateData } = req.body;

    // Prevent updating jobListingId after creation
    const existingConversation = await Conversation.findById(req.params.id);
    if (!existingConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (jobListingId && jobListingId !== existingConversation.jobListingId.toString()) {
      return res.status(400).json({ message: "jobListingId cannot be changed" });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("participants").populate("jobListingId");

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
    res.status(204).end(); // 204 No Content
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller functions for messages within a conversation
const addMessageToConversation = async (req, res) => {
  try {
    
    const { senderId, senderRole, senderName, text, attachments } = req.body;
    
    if (!senderId || !senderName || !text) {
      return res.status(400).json({ message: "Missing required message fields" });
    }
    
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const newMessage = { senderId, senderName, text, attachments };
    
    conversation.messages.push(newMessage);
    conversation.lastMessage = conversation.messages[conversation.messages.length - 1];


    

    await conversation.save();

    // Assuming the recruiter is at index 0 in the participants array and job seeker at index 1.
    const recruiterParticipantId = conversation.participants[0];
    const jobSeekerParticipantId = conversation.participants[1];

    // Determine the receiver based on the sender's role
    const recieverId = senderRole === "recruiter" ? jobSeekerParticipantId : recruiterParticipantId;

    
    const reciever = senderRole === "recruiter" ?
      await JobSeeker.findById(recieverId) :
      await Recruiter.findById(recieverId);

    if (!reciever) {
      return res.status(404).json({ message: "Reciever not found" });
    }

    const jobListing = await JobListing.findById(conversation.jobListingId);
    
    
    
    // Create and push a new notification to the receiver
    const newNotification = {
      type: "chat",
      message: `${senderName}: ${text}`,
      conversationId: conversation._id,
      extraData: {
        goToRoute: senderRole === "recruiter" ? '/searchjobs' : '/dashboard',
        stateAddition: {
          conversationId: conversation._id,
          jobListing,
        },
      },
    };
    if (!reciever.notifications) {
      reciever.notifications = [];
    }
    reciever.notifications.push(newNotification);
    await reciever.save();
    
    // Retrieve the Socket.IO instance from the app and emit the notification event.
    const io = req.app.get("io");

    let notificationWithMessageObject = newNotification;
    notificationWithMessageObject.messageObject = newMessage;

    notificationWithMessageObject.messageObject.timestamp = new Date().toISOString();

    
    // Assuming the receiver's socket(s) join a room identified by their user ID (as a string)
    io.to(reciever._id.toString()).emit("newNotification", notificationWithMessageObject);

    res.status(201).json(conversation);
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

    conversation.messages[messageIndex] = {
      ...conversation.messages[messageIndex],
      ...updatedMessage,
    };
    await conversation.save();

    res.json(conversation);
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

    res.status(204).json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getJobListingConversations = async (req, res) => {
  try {
    const jobListingId = req.params.jobListingId;
    const conversations = await Conversation.find({ jobListingId });

    res.status(200).json({jobListingConversations: conversations});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const markMessagesAsReadInternal = async (conversationId, readerId) => {
  // Update all messages (where the sender is not the reader) to read: true
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $set: { "messages.$[elem].read": true },
    },
    {
      new: true,
      arrayFilters: [{ "elem.senderId": { $ne: readerId } }],
    }
  );

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  // Assume participants[0] is the recruiter and participants[1] is the jobseeker.
  const recruiterParticipantId = conversation.participants[0].toString();
  const jobSeekerParticipantId = conversation.participants[1].toString();

  // Determine the "other" party (i.e. the one who did not read)
  const participantToUpdateId =
    readerId === recruiterParticipantId ? jobSeekerParticipantId : recruiterParticipantId;

  return { conversation, participantToUpdateId };
};

const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { readerId } = req.body;

    const { conversation, participantToUpdateId } = await markMessagesAsReadInternal(conversationId, readerId);

    // Get the io instance from the app locals and emit to the other party.
    const io = req.app.get("io");
    io.to(participantToUpdateId).emit("updateReadMessages", conversationId);

    res.status(200).json({ message: "Messages marked as read", conversation });
  } catch (error) {
    console.error("Error marking messages as read:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { markMessagesAsRead, markMessagesAsReadInternal };


module.exports = {
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
  markMessagesAsReadInternal,
};
