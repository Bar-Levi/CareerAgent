const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const saveJobListingRoutes = require('../../../routes/saveJobListingRoutes');
const JobSeeker = require('../../../models/jobSeekerModel');
const { protect } = require('../../../middleware/authMiddleware');
const { cleanupTask } = require('../../../tasks/cleanupTokens');

// Set NODE_ENV to test to ensure test isolation
process.env.NODE_ENV = 'test';

// Mock dependencies
jest.mock('../../../middleware/authMiddleware', () => ({
  protect: jest.fn((req, res, next) => {
    // Default behavior: call next() to proceed
    next();
  })
}));

// Mock the JobSeeker model - focus specifically on the methods used by the controller
jest.mock('../../../models/jobSeekerModel', () => ({
  findByIdAndUpdate: jest.fn().mockImplementation(() => Promise.resolve({ 
    _id: 'mockId', 
    savedJobListings: [] 
  }))
}));

// Increase timeout for this test suite
jest.setTimeout(30000);

// Set up express app
const app = express();
app.use(express.json());
app.use('/api/users', saveJobListingRoutes);

// Utility to create a job seeker for testing
const createTestJobSeeker = async (userId) => {
  return await JobSeeker.create({
    _id: userId,
    email: `testuser_${new mongoose.Types.ObjectId().toString()}@example.com`, // Ensure unique email
    password: 'password123',
    fullName: 'Test Seeker',
    role: 'JobSeeker'
    // Add any other required fields based on your JobSeeker schema
  });
};

describe('Save Job Listing Routes', () => {
  // Mock data
  const testUserId = new mongoose.Types.ObjectId().toString();
  const testJobId = new mongoose.Types.ObjectId().toString();

  // Clean up after tests
  afterAll(() => {
    console.log('Stopped cleanup task for saveJobListingRoutes tests.');
  });

  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/:userId/saved/:jobId', () => {
    // Increasing timeouts for all tests in this block
    jest.setTimeout(15000);
    
    it('should save a job listing for the user and return 200', async () => {
      const response = await request(app)
        .post(`/api/users/${testUserId}/saved/${testJobId}`)
        .send();
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Job saved successfully');
      
      // Verify findByIdAndUpdate was called with correct parameters
      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith(
        testUserId,
        { $addToSet: { savedJobListings: testJobId } }
      );
    });
    
    it('should return 401 if protect middleware fails (simulated)', async () => {
      // Setup protect middleware to fail
      protect.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Not authorized' });
      });
      
      const response = await request(app)
        .post(`/api/users/${testUserId}/saved/${testJobId}`)
        .send();
      
      expect(response.statusCode).toBe(401);
    });
  });
  
  describe('DELETE /api/users/:userId/saved/:jobId', () => {
    // Increasing timeouts for all tests in this block
    jest.setTimeout(15000);
    
    it('should unsave a job listing for the user and return 200', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}/saved/${testJobId}`)
        .send();
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Job removed from saved');
      
      // Verify findByIdAndUpdate was called with correct parameters
      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith(
        testUserId,
        { $pull: { savedJobListings: testJobId } }
      );
    });
    
    it('should return 401 if protect middleware fails (simulated)', async () => {
      // Setup protect middleware to fail
      protect.mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ message: 'Not authorized' });
      });
      
      const response = await request(app)
        .delete(`/api/users/${testUserId}/saved/${testJobId}`)
        .send();
      
      expect(response.statusCode).toBe(401);
    });
  });
});

afterAll(() => {
  if (cleanupTask && cleanupTask.stop) {
    cleanupTask.stop();
    console.log('Stopped cleanup task for saveJobListingRoutes tests.');
  }
}); 