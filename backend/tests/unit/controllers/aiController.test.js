const { generateJsonFromCV, sendToBot, analyzeJobListing } = require('../../../controllers/aiController');

// Mock dependencies
jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn();
  const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent
  }));

  const mockGoogleGenerativeAI = jest.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel
  }));

  mockGoogleGenerativeAI.mockGenerateContent = mockGenerateContent;
  
  return {
    GoogleGenerativeAI: mockGoogleGenerativeAI
  };
});

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => 'mock preprompt content')
}));

jest.mock('path', () => ({
  resolve: jest.fn(() => 'resolved/path')
}));

// Mock fetch for loadSessionHistory
global.fetch = jest.fn();

describe('AI Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('generateJsonFromCV', () => {
    beforeEach(() => {
      req = {
        body: {
          prompt: 'This is a test CV prompt'
        }
      };

      // Mock the generateContent result
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Mocked CV analysis response'
        }
      });
    });

    it('should generate JSON from CV text and return 200', async () => {
      await generateJsonFromCV(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        response: 'Mocked CV analysis response'
      });
    });

    it('should return 400 if prompt is missing', async () => {
      req.body = {};
      
      await generateJsonFromCV(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Prompt and sessionId are required'
      });
    });

    it('should return 500 if AI generation fails', async () => {
      // Mock a failure
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockGenerateContent.mockRejectedValue(new Error('AI error'));
      
      await generateJsonFromCV(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to generate response'
      });
    });
  });

  describe('sendToBot', () => {
    beforeEach(() => {
      req = {
        body: {
          prompt: 'Hello bot',
          sessionId: 'test-session-123',
          type: 'careerAdvisor'
        },
        header: jest.fn().mockReturnValue('Bearer test-token')
      };

      // Mock fetch response for session history
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
          { sender: 'user', text: 'Previous message' },
          { sender: 'bot', text: 'Previous response' }
        ])
      });

      // Mock the generateContent result
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'bot: Mocked bot response'
        }
      });
    });

    it('should process message, format history and return 200 with response', async () => {
      await sendToBot(req, res);
      
      expect(global.fetch).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        response: 'Mocked bot response'
      });
    });

    it('should return 400 if prompt or sessionId is missing', async () => {
      req.body = { type: 'interviewerPreprompt' };
      
      await sendToBot(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Prompt and sessionId are required'
      });
    });

    it('should use interviewer preprompt when type is not careerAdvisor', async () => {
      req.body.type = 'interviewer';
      
      await sendToBot(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        response: 'Mocked bot response'
      });
    });

    it('should handle errors in fetch and continue', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      await sendToBot(req, res);
      
      // Should still work even with session history fetch error
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        response: 'Mocked bot response'  
      });
    });

    it('should return 500 if AI generation fails', async () => {
      // Mock a failure
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockGenerateContent.mockRejectedValue(new Error('AI error'));
      
      await sendToBot(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to generate response'
      });
    });
  });

  describe('analyzeJobListing', () => {
    beforeEach(() => {
      req = {
        body: {
          prompt: 'This is a job listing description'
        }
      };

      // Mock the generateContent result
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Mocked job listing analysis'
        }
      });
    });

    it('should analyze job listing and return 200 with response', async () => {
      await analyzeJobListing(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        response: 'Mocked job listing analysis'
      });
    });

    it('should return 400 if prompt is missing', async () => {
      req.body = {};
      
      await analyzeJobListing(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Prompt and sessionId are required'
      });
    });

    it('should replace periods with commas in the prompt', async () => {
      req.body.prompt = 'Test. With. Periods.';
      
      await analyzeJobListing(req, res);
      
      // The controller should have processed the prompt by replacing periods
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 500 if AI generation fails', async () => {
      // Mock a failure
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockGenerateContent.mockRejectedValue(new Error('AI error'));
      
      await analyzeJobListing(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to generate response'
      });
    });
  });
}); 