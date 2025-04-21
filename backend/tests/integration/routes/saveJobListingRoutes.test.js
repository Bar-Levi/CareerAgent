const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const saveJobListingRoutes = require('../../../routes/saveJobListingRoutes');
const JobSeeker = require('../../../models/jobSeekerModel');
const { protect } = require('../../../middleware/authMiddleware');
const { cleanupTask } = require('../../../tasks/cleanupTokens');

// Mock the protect middleware
jest.mock('../../../middleware/authMiddleware', () => ({
  protect: jest.fn((req, res, next) => {
    // Simulate an authenticated user for testing
    req.user = {
      _id: 'mockUserIdForTest',
      userType: 'JobSeeker'
    };
    next();
  }),
}));

// Set up the express app for testing
const { app } = require('../../../server');
app.use(express.json()); // Needed to parse request bodies
app.use('/api/users', saveJobListingRoutes); // Mount routes with a base path if applicable

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
  let testUserId;
  let testJobId = new mongoose.Types.ObjectId().toString();

  beforeEach(async () => {
    // Clear mocks and database before each test
    protect.mockClear();
    await JobSeeker.deleteMany({});

    // Create a user for testing save/unsave operations
    const user = await createTestJobSeeker(new mongoose.Types.ObjectId());
    testUserId = user._id.toString();

    // Re-apply protect mock middleware logic for each test
    protect.mockImplementation((req, res, next) => {
      req.user = { _id: testUserId, userType: 'JobSeeker' };
      next();
    });
  });

  describe('POST /api/users/:userId/saved/:jobId', () => {
    it('should save a job listing for the user and return 200', async () => {
      const response = await request(app)
        .post(`/api/users/${testUserId}/saved/${testJobId}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Job saved successfully');

      // Verify in DB
      const updatedUser = await JobSeeker.findById(testUserId);
      expect(updatedUser.savedJobListings).toContainEqual(new mongoose.Types.ObjectId(testJobId));
      expect(protect).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if protect middleware fails (simulated)', async () => {
      // Override protect mock to simulate failure
      protect.mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'Not authorized, no token' });
      });

      const response = await request(app)
        .post(`/api/users/${testUserId}/saved/${testJobId}`)
        .send();

      expect(response.statusCode).toBe(401);
      expect(protect).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/users/:userId/saved/:jobId', () => {
    beforeEach(async () => {
      // Pre-save a job for the user to test deletion
      await JobSeeker.findByIdAndUpdate(testUserId, { $addToSet: { savedJobListings: testJobId } });
    });

    it('should unsave a job listing for the user and return 200', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}/saved/${testJobId}`)
        .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Job removed from saved');

      // Verify in DB
      const updatedUser = await JobSeeker.findById(testUserId);
      expect(updatedUser.savedJobListings).not.toContainEqual(new mongoose.Types.ObjectId(testJobId));
      expect(protect).toHaveBeenCalledTimes(1);
    });

     it('should return 401 if protect middleware fails (simulated)', async () => {
      // Override protect mock to simulate failure
      protect.mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'Not authorized, no token' });
      });

      const response = await request(app)
        .delete(`/api/users/${testUserId}/saved/${testJobId}`)
        .send();

      expect(response.statusCode).toBe(401);
      expect(protect).toHaveBeenCalledTimes(1);
    });
  });
});

afterAll(() => {
  if (cleanupTask && cleanupTask.stop) {
    cleanupTask.stop();
    console.log('Stopped cleanup task for saveJobListingRoutes tests.');
  }
}); 