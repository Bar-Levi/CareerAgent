const mongoose = require('mongoose');
const {
  getAllConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  addMessageToConversation,
  updateMessageInConversation,
  deleteMessageFromConversation,
  getJobListingConversations,
  getConversationByJobCandidateId,
  markMessagesAsRead,
  getJobListingIdByConversationId,
  hideConversation
} = require('../../../controllers/conversationController');

const Conversation = require('../../../models/conversationModel');
const JobListing = require('../../../models/jobListingModel');
const Recruiter = require('../../../models/recruiterModel');
const JobSeeker = require('../../../models/jobSeekerModel');

// Mock dependencies
jest.mock('../../../models/conversationModel');
jest.mock('../../../models/jobListingModel');
jest.mock('../../../models/recruiterModel');
jest.mock('../../../models/jobSeekerModel');

describe('Conversation Controller', () => {
  let req, res;
  // Create mock IDs
  const mockRecruiterId = new mongoose.Types.ObjectId().toString();
  const mockJobSeekerId = new mongoose.Types.ObjectId().toString();
  const mockJobListingId = new mongoose.Types.ObjectId().toString();
  const mockConversationId = new mongoose.Types.ObjectId().toString();
  const mockMessageId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      params: {},
      body: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };

    // Mock conversation data
    const mockMessages = [
      {
        _id: mockMessageId,
        senderId: mockRecruiterId,
        senderName: 'John Recruiter',
        senderRole: 'Recruiter',
        text: 'Hello',
        timestamp: new Date('2023-01-02'),
        isRead: false,
        readBy: []
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        senderId: mockJobSeekerId,
        senderName: 'Jane JobSeeker',
        senderRole: 'JobSeeker',
        text: 'Hi there',
        timestamp: new Date('2023-01-01'),
        isRead: true,
        readBy: [mockRecruiterId]
      }
    ];

    // Define mock participants
    const mockParticipants = [
      { 
        userId: mockJobSeekerId, 
        role: 'JobSeeker',
        isVisible: true 
      },
      { 
        userId: mockRecruiterId, 
        role: 'Recruiter',
        isVisible: true
      }
    ];

    // Mock Conversation.findById return value
    const mockConversation = {
      _id: mockConversationId,
      participants: mockParticipants,
      jobListingId: mockJobListingId,
      jobListingRole: 'Software Engineer',
      isGroupChat: false,
      messages: mockMessages,
      lastMessage: mockMessages[0],
      toObject: jest.fn().mockReturnValue({
        _id: mockConversationId,
        participants: mockParticipants,
        jobListingId: mockJobListingId,
        jobListingRole: 'Software Engineer',
        isGroupChat: false,
        messages: mockMessages,
        lastMessage: mockMessages[0]
      }),
      save: jest.fn().mockResolvedValue(true)
    };

    // Setup default mock implementations
    Conversation.find.mockResolvedValue([mockConversation]);
    Conversation.findById.mockResolvedValue(mockConversation);
    Conversation.findOne.mockResolvedValue(null); // Default: no existing conversation
    Conversation.findByIdAndUpdate.mockResolvedValue(mockConversation);
    Conversation.findByIdAndDelete.mockResolvedValue(mockConversation);

    // Mock JobListing.findById
    JobListing.findById.mockResolvedValue({
      _id: mockJobListingId,
      jobRole: 'Software Engineer',
      company: 'Tech Co'
    });

    // Mock Recruiter.findById
    Recruiter.findById.mockResolvedValue({
      _id: mockRecruiterId,
      fullName: 'John Recruiter',
      profilePic: 'recruiter.jpg'
    });

    // Mock JobSeeker.findById
    JobSeeker.findById.mockResolvedValue({
      _id: mockJobSeekerId,
      fullName: 'Jane JobSeeker',
      profilePic: 'jobseeker.jpg'
    });
  });

  describe('getAllConversations', () => {
    it('should return all conversations', async () => {
      await getAllConversations(req, res);
      
      expect(Conversation.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Reset mocks to ensure proper behavior
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      
      // Mock the rejected Promise with a try-catch pattern to avoid unhandled rejections
      Conversation.find = jest.fn().mockImplementation(() => {
        return {
          populate: jest.fn().mockImplementation(() => {
            return {
              sort: jest.fn().mockImplementation(() => {
                return Promise.reject(new Error('Database error'));
              })
            };
          })
        };
      });
      
      await getAllConversations(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('getConversationById', () => {
    beforeEach(() => {
      req.params = { conversationId: mockConversationId };
      req.query = { limit: 50, skip: 0 };
      
      // Create a properly populated conversation with a working toObject method
      const mockPopulatedConversation = {
        _id: mockConversationId,
        participants: [
          { 
            userId: mockJobSeekerId, 
            role: 'JobSeeker',
            isVisible: true 
          },
          { 
            userId: mockRecruiterId, 
            role: 'Recruiter',
            isVisible: true
          }
        ],
        jobListingId: { 
          _id: mockJobListingId, 
          jobRole: 'Software Engineer',
          company: 'Tech Co'
        },
        jobListingRole: 'Software Engineer',
        isGroupChat: false,
        messages: [
          {
            _id: mockMessageId,
            senderId: mockRecruiterId,
            senderName: 'John Recruiter',
            senderRole: 'Recruiter',
            text: 'Hello',
            timestamp: new Date('2023-01-02'),
            isRead: false,
            readBy: []
          },
          {
            _id: new mongoose.Types.ObjectId().toString(),
            senderId: mockJobSeekerId,
            senderName: 'Jane JobSeeker',
            senderRole: 'JobSeeker',
            text: 'Hi there',
            timestamp: new Date('2023-01-01'),
            isRead: true,
            readBy: [mockRecruiterId]
          }
        ],
        lastMessage: {
          _id: mockMessageId,
          senderId: mockRecruiterId,
          senderName: 'John Recruiter',
          senderRole: 'Recruiter',
          text: 'Hello',
          timestamp: new Date('2023-01-02'),
          isRead: false,
          readBy: []
        },
        toObject: jest.fn().mockReturnValue({
          _id: mockConversationId,
          participants: [
            { 
              userId: mockJobSeekerId, 
              role: 'JobSeeker',
              isVisible: true 
            },
            { 
              userId: mockRecruiterId, 
              role: 'Recruiter',
              isVisible: true
            }
          ],
          jobListingId: { 
            _id: mockJobListingId, 
            jobRole: 'Software Engineer',
            company: 'Tech Co'
          },
          jobListingRole: 'Software Engineer',
          isGroupChat: false,
          messages: [
            {
              _id: mockMessageId,
              senderId: mockRecruiterId,
              senderName: 'John Recruiter',
              senderRole: 'Recruiter',
              text: 'Hello',
              timestamp: new Date('2023-01-02'),
              isRead: false,
              readBy: []
            },
            {
              _id: new mongoose.Types.ObjectId().toString(),
              senderId: mockJobSeekerId,
              senderName: 'Jane JobSeeker',
              senderRole: 'JobSeeker',
              text: 'Hi there',
              timestamp: new Date('2023-01-01'),
              isRead: true,
              readBy: [mockRecruiterId]
            }
          ],
          lastMessage: {
            _id: mockMessageId,
            senderId: mockRecruiterId,
            senderName: 'John Recruiter',
            senderRole: 'Recruiter',
            text: 'Hello',
            timestamp: new Date('2023-01-02'),
            isRead: false,
            readBy: []
          }
        })
      };

      // Mock the populate chain correctly
      Conversation.findById = jest.fn().mockImplementation(() => {
        return {
          populate: jest.fn().mockImplementation(() => {
            return {
              populate: jest.fn().mockResolvedValue(mockPopulatedConversation)
            };
          })
        };
      });
    });

    it('should return a conversation with paginated messages', async () => {
      await getConversationById(req, res);
      
      expect(Conversation.findById).toHaveBeenCalledWith(mockConversationId);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        conversation: expect.any(Object),
        pics: expect.arrayContaining([
          expect.objectContaining({ role: 'Recruiter' }),
          expect.objectContaining({ role: 'JobSeeker' })
        ])
      }));
    });

    it('should return 404 if conversation not found', async () => {
      // Mock findById to return null for this test
      Conversation.findById = jest.fn().mockImplementation(() => {
        return {
          populate: jest.fn().mockImplementation(() => {
            return {
              populate: jest.fn().mockResolvedValue(null)
            };
          })
        };
      });
      
      await getConversationById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Conversation not found'
      }));
    });

    it('should handle errors', async () => {
      // Reset mocks to ensure proper behavior
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      
      // Mock the rejected Promise
      Conversation.findById = jest.fn().mockImplementation(() => {
        return {
          populate: jest.fn().mockImplementation(() => {
            return {
              populate: jest.fn().mockRejectedValue(new Error('Database error'))
            };
          })
        };
      });
      
      await getConversationById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Server error')
      }));
    });
  });

  describe('createConversation', () => {
    beforeEach(() => {
      req.body = {
        isJobSeeker: true,
        participants: [
          { userId: mockJobSeekerId, role: 'JobSeeker', isVisible: true },
          { userId: mockRecruiterId, role: 'Recruiter', isVisible: true }
        ],
        jobListingId: mockJobListingId,
        isGroupChat: false
      };

      // Mock Conversation constructor and save method
      Conversation.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          _id: mockConversationId,
          ...req.body,
          jobListingRole: 'Software Engineer'
        })
      }));
    });

    it('should create a new conversation if one does not exist', async () => {
      await createConversation(req, res);
      
      expect(JobListing.findById).toHaveBeenCalledWith(mockJobListingId);
      expect(Conversation.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        conversation: expect.objectContaining({
          jobListingRole: 'Software Engineer'
        }),
        jobListingObject: expect.any(Object)
      }));
    });

    it('should return existing conversation if one already exists', async () => {
      const existingConversation = {
        _id: mockConversationId,
        participants: [
          { userId: mockJobSeekerId, role: 'JobSeeker', isVisible: false },
          { userId: mockRecruiterId, role: 'Recruiter', isVisible: true }
        ],
        jobListingId: mockJobListingId,
        save: jest.fn().mockResolvedValue(true)
      };
      
      Conversation.findOne.mockResolvedValue(existingConversation);
      
      await createConversation(req, res);
      
      expect(existingConversation.participants[0].isVisible).toBe(true);
      expect(existingConversation.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        conversation: existingConversation
      }));
    });

    it('should return 400 if jobListingId is missing', async () => {
      req.body.jobListingId = undefined;
      
      await createConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'jobListingId is required' });
    });

    it('should return 404 if job listing not found', async () => {
      JobListing.findById.mockResolvedValue(null);
      
      await createConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job listing not found' });
    });

    it('should handle errors', async () => {
      Conversation.findOne.mockRejectedValue(new Error('Database error'));
      
      await createConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('updateConversation', () => {
    beforeEach(() => {
      req.params = { id: mockConversationId };
      req.body = {
        isGroupChat: true,
        groupChatName: 'Team Discussion'
      };
    });

    it('should update a conversation', async () => {
      await updateConversation(req, res);
      
      expect(Conversation.findById).toHaveBeenCalledWith(mockConversationId);
      expect(Conversation.findByIdAndUpdate).toHaveBeenCalledWith(
        mockConversationId,
        req.body,
        { new: true }
      );
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if conversation not found', async () => {
      Conversation.findById.mockResolvedValue(null);
      
      await updateConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });

    it('should return 400 if trying to change jobListingId', async () => {
      req.body.jobListingId = new mongoose.Types.ObjectId().toString();
      
      await updateConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'jobListingId cannot be changed' });
    });

    it('should handle errors', async () => {
      Conversation.findById.mockRejectedValue(new Error('Database error'));
      
      await updateConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('deleteConversation', () => {
    beforeEach(() => {
      req.params = { id: mockConversationId };
    });

    it('should delete a conversation', async () => {
      await deleteConversation(req, res);
      
      expect(Conversation.findByIdAndDelete).toHaveBeenCalledWith(mockConversationId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('should return 404 if conversation not found', async () => {
      Conversation.findByIdAndDelete.mockResolvedValue(null);
      
      await deleteConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });

    it('should handle errors', async () => {
      Conversation.findByIdAndDelete.mockRejectedValue(new Error('Database error'));
      
      await deleteConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('addMessageToConversation', () => {
    beforeEach(() => {
      req.params = { id: mockConversationId };
      req.body = {
        senderId: mockRecruiterId,
        senderName: 'John Recruiter',
        senderRole: 'Recruiter',
        text: 'New message'
      };
    });

    it('should add a message to a conversation', async () => {
      const initialMessages = [...(await Conversation.findById()).messages];
      
      await addMessageToConversation(req, res);
      
      const mockConversation = await Conversation.findById();
      expect(mockConversation.messages.length).toBeGreaterThan(initialMessages.length);
      expect(mockConversation.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { text: 'Incomplete message' };
      
      await addMessageToConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required message fields' });
    });

    it('should return 404 if conversation not found', async () => {
      Conversation.findById.mockResolvedValue(null);
      
      await addMessageToConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });

    it('should return 404 if receiver not found', async () => {
      JobSeeker.findById.mockResolvedValue(null);
      
      await addMessageToConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reciever not found' });
    });
  });

  describe('updateMessageInConversation', () => {
    beforeEach(() => {
      req.params = { 
        id: mockConversationId,
        messageId: mockMessageId
      };
      req.body = {
        text: 'Updated message text'
      };
    });

    it('should update a message in a conversation', async () => {
      await updateMessageInConversation(req, res);
      
      expect(Conversation.findById).toHaveBeenCalledWith(mockConversationId);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if conversation not found', async () => {
      Conversation.findById.mockResolvedValue(null);
      
      await updateMessageInConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });

    it('should return 404 if message not found', async () => {
      // Mock a conversation without the target message
      const mockConversationWithoutMessage = {
        _id: mockConversationId,
        messages: [
          {
            _id: new mongoose.Types.ObjectId().toString(),
            text: 'Different message'
          }
        ]
      };
      
      Conversation.findById.mockResolvedValue(mockConversationWithoutMessage);
      
      await updateMessageInConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Message not found' });
    });
  });

  describe('deleteMessageFromConversation', () => {
    beforeEach(() => {
      req.params = { 
        id: mockConversationId,
        messageId: mockMessageId
      };
    });

    it('should delete a message from a conversation', async () => {
      await deleteMessageFromConversation(req, res);
      
      expect(Conversation.findById).toHaveBeenCalledWith(mockConversationId);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if conversation not found', async () => {
      Conversation.findById.mockResolvedValue(null);
      
      await deleteMessageFromConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });
  });

  describe('getJobListingConversations', () => {
    beforeEach(() => {
      req.params = { jobListingId: mockJobListingId };
      
      // Create mock conversations with the correct structure
      const mockConversations = [
        {
          _id: mockConversationId,
          participants: [
            { userId: mockJobSeekerId, role: 'JobSeeker', isVisible: true },
            { userId: mockRecruiterId, role: 'Recruiter', isVisible: true }
          ],
          jobListingId: mockJobListingId,
          lastMessage: {
            senderId: mockRecruiterId,
            text: 'Hello there',
            timestamp: new Date()
          }
        }
      ];
      
      // Simplified mock for Conversation.find - matches what the controller actually does
      Conversation.find.mockResolvedValue(mockConversations);
    });

    it('should return conversations for a specific job listing', async () => {
      await getJobListingConversations(req, res);
      
      expect(Conversation.find).toHaveBeenCalledWith({ jobListingId: mockJobListingId });
      expect(res.json).toHaveBeenCalledWith({
        jobListingConversations: expect.any(Array)
      });
    });

    it('should handle errors', async () => {
      // Reset mocks to ensure proper behavior
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      
      // Mock Conversation.find to throw error
      Conversation.find.mockRejectedValue(new Error('Database error'));
      
      await getJobListingConversations(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('getConversationByJobCandidateId', () => {
    beforeEach(() => {
      req.params = { userId: mockJobSeekerId };
    });

    it('should return conversations for a job seeker', async () => {
      // Mock Conversation.find for this specific case
      Conversation.find.mockResolvedValue([
        {
          _id: mockConversationId,
          participants: [
            { userId: mockJobSeekerId, role: 'JobSeeker' },
            { userId: mockRecruiterId, role: 'Recruiter' }
          ],
          jobListingId: { _id: mockJobListingId, jobRole: 'Software Engineer' }
        }
      ]);
      
      await getConversationByJobCandidateId(req, res);
      
      expect(Conversation.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      Conversation.find.mockRejectedValue(new Error('Database error'));
      
      await getConversationByJobCandidateId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('markMessagesAsRead', () => {
    beforeEach(() => {
      req.params = { conversationId: mockConversationId };
      req.body = { readerId: mockJobSeekerId };
      
      // Setup app for socket.io
      req.app = {
        get: jest.fn().mockReturnValue({
          to: jest.fn().mockReturnValue({
            emit: jest.fn()
          })
        })
      };
      
      // Mock the findByIdAndUpdate call
      Conversation.findByIdAndUpdate.mockResolvedValue({
        _id: mockConversationId,
        participants: [
          { userId: mockJobSeekerId, role: 'JobSeeker', isVisible: true },
          { userId: mockRecruiterId, role: 'Recruiter', isVisible: true }
        ],
        messages: [
          {
            _id: mockMessageId,
            senderId: mockRecruiterId,
            read: true
          }
        ]
      });
    });

    it('should mark messages as read', async () => {
      await markMessagesAsRead(req, res);
      
      expect(Conversation.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Messages marked as read'
      }));
    });

    it('should return 500 if conversation not found', async () => {
      // Mock findByIdAndUpdate to reject with error
      Conversation.findByIdAndUpdate.mockRejectedValue(new Error('Conversation not found'));
      
      await markMessagesAsRead(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Internal Server Error'
      }));
    });

    it('should handle errors', async () => {
      // Reset mocks to ensure proper behavior
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      
      // Mock the rejected Promise
      Conversation.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));
      
      await markMessagesAsRead(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Internal Server Error'
      }));
    });
  });

  describe('getJobListingIdByConversationId', () => {
    beforeEach(() => {
      req.params = { conversationId: mockConversationId };
    });

    it('should return job listing ID for a conversation', async () => {
      await getJobListingIdByConversationId(req, res);
      
      expect(Conversation.findById).toHaveBeenCalledWith(mockConversationId);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        jobListingId: mockJobListingId
      }));
    });

    it('should return 404 if conversation not found', async () => {
      Conversation.findById.mockResolvedValue(null);
      
      await getJobListingIdByConversationId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });

    it('should handle errors', async () => {
      Conversation.findById.mockRejectedValue(new Error('Database error'));
      
      await getJobListingIdByConversationId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('hideConversation', () => {
    beforeEach(() => {
      req.params = { convId: mockConversationId };
      req.user = { _id: mockJobSeekerId };
      
      // Mock the updateOne method to return success
      Conversation.updateOne = jest.fn().mockResolvedValue({
        matchedCount: 1,
        modifiedCount: 1
      });
    });

    it('should hide a conversation for a job seeker', async () => {
      await hideConversation(req, res);
      
      expect(Conversation.updateOne).toHaveBeenCalledWith(
        { _id: mockConversationId, "participants.0.userId": mockJobSeekerId },
        { $set: { "participants.$.isVisible": false } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Conversation hidden successfully'
      });
    });

    it('should return 404 if conversation not found', async () => {
      // Mock updateOne to return no matches
      Conversation.updateOne.mockResolvedValue({
        matchedCount: 0,
        modifiedCount: 0
      });
      
      await hideConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      // Reset mocks to ensure proper behavior
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      
      // Mock updateOne to throw error
      Conversation.updateOne.mockRejectedValue(new Error('Database error'));
      
      await hideConversation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });
}); 