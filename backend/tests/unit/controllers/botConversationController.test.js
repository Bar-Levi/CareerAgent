const {
  saveConversation,
  getConversations,
  createNewConversation,
  removeConversation,
  updateConversationTitle,
  saveMessageToConversation,
  getMessagesByConvId,
  toggleProfileSynced
} = require('../../../controllers/botConversationController');
const BotConversation = require('../../../models/botConversationModel');

// Mock the BotConversation model
jest.mock('../../../models/botConversationModel');

describe('Bot Conversation Controller', () => {
  let req, res;
  let mockDate;

  beforeEach(() => {
    // Setup request and response objects
    req = {
      body: {},
      params: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock Date.now for consistent timestamps
    mockDate = 1672531200000; // 2023-01-01
    jest.spyOn(Date, 'now').mockImplementation(() => mockDate);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore Date.now
    jest.restoreAllMocks();
  });

  describe('saveConversation', () => {
    it('should create and save a new conversation', async () => {
      // Setup
      const mockConversation = {
        _id: 'conv123',
        email: 'user@example.com',
        conversationId: 'testConversation',
        messages: [{ sender: 'user', text: 'Hello' }]
      };
      
      req.body = {
        email: 'user@example.com',
        conversationId: 'testConversation',
        messages: [{ sender: 'user', text: 'Hello' }]
      };
      
      BotConversation.create.mockResolvedValue(mockConversation);
      
      // Execute
      await saveConversation(req, res);
      
      // Verify
      expect(BotConversation.create).toHaveBeenCalledWith({
        email: 'user@example.com',
        conversationId: 'testConversation',
        messages: [{ sender: 'user', text: 'Hello' }]
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockConversation);
    });
    
    it('should handle errors and return 500', async () => {
      // Setup
      req.body = {
        email: 'user@example.com',
        conversationId: 'testConversation',
        messages: []
      };
      
      const error = new Error('Database error');
      BotConversation.create.mockRejectedValue(error);
      
      // Execute
      await saveConversation(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getConversations', () => {
    it('should return conversations for a specific email', async () => {
      // Setup
      const mockConversations = [
        { _id: 'conv123', email: 'user@example.com', messages: [] },
        { _id: 'conv456', email: 'user@example.com', messages: [] }
      ];
      
      req.query = { email: 'user@example.com' };
      
      BotConversation.find.mockResolvedValue(mockConversations);
      
      // Execute
      await getConversations(req, res);
      
      // Verify
      expect(BotConversation.find).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockConversations);
    });
    
    it('should handle errors and return 500', async () => {
      // Setup
      req.query = { email: 'user@example.com' };
      
      const error = new Error('Database error');
      BotConversation.find.mockRejectedValue(error);
      
      // Execute
      await getConversations(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getMessagesByConvId', () => {
    it('should return messages for a specific conversation', async () => {
      // Setup
      const mockMessages = [
        { sender: 'user', text: 'Hello' },
        { sender: 'bot', text: 'Hi there!' }
      ];
      
      const mockConversation = [
        { _id: 'conv123', conversationId: 'conv1', messages: mockMessages }
      ];
      
      req.query = { convId: 'conv1' };
      
      BotConversation.find.mockResolvedValue(mockConversation);
      
      // Execute
      await getMessagesByConvId(req, res);
      
      // Verify
      expect(BotConversation.find).toHaveBeenCalledWith({ conversationId: 'conv1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });
    
    it('should handle errors and return 500', async () => {
      // Setup
      req.query = { convId: 'conv1' };
      
      const error = new Error('Database error');
      BotConversation.find.mockRejectedValue(error);
      
      // Execute
      await getMessagesByConvId(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('createNewConversation', () => {
    it('should create a new conversation with type and email', async () => {
      // Setup
      const mockConversation = {
        _id: 'conv123',
        email: 'user@example.com',
        type: 'careerAdvisor',
        conversationId: 'careerAdvisor-1672531200000',
        messages: [],
        startDate: new Date()
      };
      
      req.body = {
        email: 'user@example.com',
        type: 'careerAdvisor'
      };
      
      BotConversation.find.mockResolvedValue([]);
      BotConversation.create.mockResolvedValue(mockConversation);
      
      // Execute
      await createNewConversation(req, res);
      
      // Verify
      expect(BotConversation.find).toHaveBeenCalledWith({ 
        email: 'user@example.com', 
        type: 'careerAdvisor' 
      });
      expect(BotConversation.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'user@example.com',
        type: 'careerAdvisor',
        conversationId: 'careerAdvisor-1672531200000',
        messages: []
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockConversation);
    });

    it('should create a new conversation with job data and set conversation title', async () => {
      // Setup
      const jobData = {
        jobRole: 'Software Engineer',
        recruiterName: 'John Doe'
      };
      
      const mockConversation = {
        _id: 'conv123',
        email: 'user@example.com',
        type: 'interviewer',
        conversationId: 'interviewer-1672531200000',
        conversationTitle: 'Interview for Software Engineer. Recruiter: John Doe',
        messages: [],
        startDate: new Date(),
        jobData
      };
      
      req.body = {
        email: 'user@example.com',
        type: 'interviewer',
        jobData
      };
      
      BotConversation.find.mockResolvedValue([]);
      BotConversation.create.mockResolvedValue(mockConversation);
      
      // Execute
      await createNewConversation(req, res);
      
      // Verify
      expect(BotConversation.create).toHaveBeenCalledWith(expect.objectContaining({
        conversationTitle: 'Interview for Software Engineer. Recruiter: John Doe',
        jobData
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockConversation);
    });

    it('should return 400 if user reached maximum conversations', async () => {
      // Setup
      req.body = {
        email: 'user@example.com',
        type: 'careerAdvisor'
      };
      
      // Mock 10 existing conversations (maximum limit)
      const existingConversations = Array(10).fill().map((_, i) => ({ 
        _id: `conv${i}`, 
        email: 'user@example.com',
        type: 'careerAdvisor'
      }));
      
      BotConversation.find.mockResolvedValue(existingConversations);
      
      // Execute
      await createNewConversation(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'You have reached the maximum number of career advisor conversations. Remove some and try again.'
      });
    });
    
    it('should handle errors and return 500', async () => {
      // Setup
      req.body = {
        email: 'user@example.com',
        type: 'careerAdvisor'
      };
      
      const error = new Error('Database error');
      BotConversation.find.mockRejectedValue(error);
      
      // Execute
      await createNewConversation(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('removeConversation', () => {
    it('should delete a conversation by id', async () => {
      // Setup
      const mockConversation = {
        _id: 'conv123',
        email: 'user@example.com',
        messages: []
      };
      
      req.params = { id: 'conv123' };
      
      BotConversation.findByIdAndDelete.mockResolvedValue(mockConversation);
      
      // Execute
      await removeConversation(req, res);
      
      // Verify
      expect(BotConversation.findByIdAndDelete).toHaveBeenCalledWith('conv123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation deleted successfully' });
    });
    
    it('should return 404 if conversation not found', async () => {
      // Setup
      req.params = { id: 'conv123' };
      
      BotConversation.findByIdAndDelete.mockResolvedValue(null);
      
      // Execute
      await removeConversation(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });
    
    it('should handle errors and return 500', async () => {
      // Setup
      req.params = { id: 'conv123' };
      
      const error = new Error('Database error');
      BotConversation.findByIdAndDelete.mockRejectedValue(error);
      
      // Execute
      await removeConversation(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('updateConversationTitle', () => {
    it('should update conversation title', async () => {
      // Setup
      const updatedConversation = {
        _id: 'conv123',
        email: 'user@example.com',
        conversationTitle: 'New Title'
      };
      
      req.params = { id: 'conv123' };
      req.body = { conversationTitle: 'New Title' };
      
      BotConversation.findByIdAndUpdate.mockResolvedValue(updatedConversation);
      
      // Execute
      await updateConversationTitle(req, res);
      
      // Verify
      expect(BotConversation.findByIdAndUpdate).toHaveBeenCalledWith(
        'conv123',
        { conversationTitle: 'New Title' },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedConversation);
    });
    
    it('should return 404 if conversation not found', async () => {
      // Setup
      req.params = { id: 'conv123' };
      req.body = { conversationTitle: 'New Title' };
      
      BotConversation.findByIdAndUpdate.mockResolvedValue(null);
      
      // Execute
      await updateConversationTitle(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });
    
    it('should handle errors and return 500', async () => {
      // Setup
      req.params = { id: 'conv123' };
      req.body = { conversationTitle: 'New Title' };
      
      const error = new Error('Database error');
      BotConversation.findByIdAndUpdate.mockRejectedValue(error);
      
      // Execute
      await updateConversationTitle(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('saveMessageToConversation', () => {
    it('should add a message to a conversation', async () => {
      // Setup
      const mockConversation = {
        _id: 'conv123',
        messages: [{ sender: 'user', text: 'Hello' }],
        save: jest.fn().mockResolvedValue(true)
      };
      
      req.params = { id: 'conv123' };
      req.body = { message: { sender: 'bot', text: 'Hi there!' } };
      
      BotConversation.findById.mockResolvedValue(mockConversation);
      
      // Execute
      await saveMessageToConversation(req, res);
      
      // Verify
      expect(BotConversation.findById).toHaveBeenCalledWith('conv123');
      expect(mockConversation.messages[mockConversation.messages.length - 1]).toEqual({ sender: 'bot', text: 'Hi there!' });
      expect(mockConversation.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Message saved successfully' });
    });
    
    it('should return 404 if conversation not found', async () => {
      // Setup
      req.params = { id: 'conv123' };
      req.body = { message: { sender: 'bot', text: 'Hi there!' } };
      
      BotConversation.findById.mockResolvedValue(null);
      
      // Execute
      await saveMessageToConversation(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Conversation not found' });
    });
    
    it('should return 400 if conversation has reached message limit', async () => {
      // Setup
      const mockConversation = {
        _id: 'conv123',
        messages: Array(100).fill({ sender: 'user', text: 'Message' })
      };
      
      req.params = { id: 'conv123' };
      req.body = { message: { sender: 'bot', text: 'Hi there!' } };
      
      BotConversation.findById.mockResolvedValue(mockConversation);
      
      // Execute
      await saveMessageToConversation(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'This conversation already has 100 messages. Please start a new conversation.' 
      });
    });
    
    it('should handle errors and return 500', async () => {
      // Setup
      req.params = { id: 'conv123' };
      req.body = { message: { sender: 'bot', text: 'Hi there!' } };
      
      const error = new Error('Database error');
      BotConversation.findById.mockRejectedValue(error);
      
      // Execute
      await saveMessageToConversation(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('toggleProfileSynced', () => {
    it('should toggle isProfileSynced status', async () => {
      // Setup
      const mockConversation = {
        _id: 'conv123',
        isProfileSynced: false
      };
      
      const updatedConversation = {
        _id: 'conv123',
        isProfileSynced: true
      };
      
      req.params = { id: 'conv123' };
      
      BotConversation.findById.mockResolvedValue(mockConversation);
      BotConversation.findByIdAndUpdate.mockResolvedValue(updatedConversation);
      
      // Execute
      await toggleProfileSynced(req, res);
      
      // Verify
      expect(BotConversation.findById).toHaveBeenCalledWith('conv123');
      expect(BotConversation.findByIdAndUpdate).toHaveBeenCalledWith(
        'conv123',
        { isProfileSynced: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedConversation);
    });
    
    it('should return 404 if conversation not found', async () => {
      // Setup
      req.params = { id: 'conv123' };
      
      BotConversation.findById.mockResolvedValue(null);
      
      // Execute
      await toggleProfileSynced(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Conversation not found' });
    });
    
    it('should handle errors and return 500', async () => {
      // Setup
      req.params = { id: 'conv123' };
      
      const error = new Error('Database error');
      BotConversation.findById.mockRejectedValue(error);
      
      // Execute
      await toggleProfileSynced(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
}); 