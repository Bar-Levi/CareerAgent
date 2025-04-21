const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const interviewRoutes = require('../../../routes/interviewRoutes');
const Interview = require('../../../models/interviewModel');
const JobListing = require('../../../models/jobListingModel');
const JobSeeker = require('../../../models/jobSeekerModel');
const Recruiter = require('../../../models/recruiterModel');
const Applicant = require('../../../models/applicantModel');
const jwt = require('jsonwebtoken');

// Create an express app for testing
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock middleware to ensure the app object has a "get" method for Socket.IO
app.set = jest.fn();
app.get = jest.fn().mockImplementation((key) => {
  if (key === 'io') {
    return {
      to: jest.fn().mockReturnValue({
        emit: jest.fn()
      })
    };
  }
  return null;
});

app.use('/api/interviews', interviewRoutes);

// Mock all models
jest.mock('../../../models/interviewModel', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));
jest.mock('../../../models/jobListingModel');
jest.mock('../../../models/jobSeekerModel');
jest.mock('../../../models/recruiterModel');
jest.mock('../../../models/applicantModel');

// Mock JWT
jest.mock('jsonwebtoken');

// Mock the middleware
jest.mock('../../../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    // Skip authentication in tests
    req.user = { id: 'mockUserId' };
    next();
  }
}));

describe('Interview Routes', () => {
  let mockToken;
  let mockRecruiter;
  let mockJobSeeker;
  let mockJobListing;
  let mockInterview;
  let mockApplicantId;
  let cleanupInterval;

  beforeAll(() => {
    // Create a cleanup task to avoid open handles
    cleanupInterval = setInterval(() => {}, 1000);
    console.log('Starting cleanup task for interviewRoutes tests.');
  });

  afterAll(() => {
    clearInterval(cleanupInterval);
    console.log('Stopped cleanup task for interviewRoutes tests.');
  });

  beforeEach(() => {
    // Setup test data
    mockRecruiter = {
      _id: new mongoose.Types.ObjectId().toString(),
      fullName: 'Test Recruiter',
      email: 'recruiter@test.com',
      role: 'recruiter',
      password: 'hashedPassword123',
      isVerified: true,
      notifications: [],
      save: jest.fn().mockResolvedValue(true)
    };

    mockJobSeeker = {
      _id: new mongoose.Types.ObjectId().toString(),
      fullName: 'Test JobSeeker',
      email: 'jobseeker@test.com',
      role: 'jobSeeker',
      password: 'hashedPassword123',
      isVerified: true,
      notifications: [],
      numOfInterviewsScheduled: 0,
      save: jest.fn().mockResolvedValue(true)
    };

    mockJobListing = {
      _id: new mongoose.Types.ObjectId().toString(),
      jobRole: 'Software Developer',
      company: 'Test Company',
      location: 'Remote',
      recruiter: mockRecruiter._id,
      recruiterName: mockRecruiter.fullName
    };

    mockApplicantId = new mongoose.Types.ObjectId().toString();

    mockInterview = {
      _id: new mongoose.Types.ObjectId().toString(),
      participants: [
        { userId: mockJobSeeker._id, role: 'JobSeeker' },
        { userId: mockRecruiter._id, role: 'Recruiter' }
      ],
      jobListing: mockJobListing,
      scheduledTime: new Date('2023-04-15T10:00:00Z'),
      status: 'scheduled',
      meetingLink: 'https://meet.test.com/123',
      notes: 'Please be prepared to discuss your experience'
    };

    // Mock JWT verification
    jwt.verify.mockImplementation(() => ({ id: mockRecruiter._id }));

    // Set mock token
    mockToken = 'valid-jwt-token';

    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mocks for models
    JobSeeker.findById = jest.fn().mockResolvedValue(mockJobSeeker);
    Recruiter.findById = jest.fn().mockResolvedValue(mockRecruiter);
    Interview.findById.mockResolvedValue(mockInterview);
    Interview.findByIdAndUpdate.mockResolvedValue(mockInterview);
    Interview.findByIdAndDelete.mockResolvedValue(mockInterview);
    
    // Mock the applicant model
    const mockApplicant = {
      _id: mockApplicantId,
      status: 'Applied',
      save: jest.fn().mockResolvedValue(true)
    };
    Applicant.findById = jest.fn().mockResolvedValue(mockApplicant);
  });

  describe('POST /', () => {
    it('should schedule a new interview', async () => {
      // Mock models
      Interview.create.mockResolvedValue(mockInterview);
      
      // Make the request
      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          applicantId: mockApplicantId,
          participants: [
            { userId: mockJobSeeker._id, role: 'JobSeeker' },
            { userId: mockRecruiter._id, role: 'Recruiter' }
          ],
          jobListing: mockJobListing,
          scheduledTime: '2023-04-15T10:00:00Z',
          meetingLink: 'https://meet.test.com/123'
        });

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Interview scheduled successfully');
      expect(response.body).toHaveProperty('interview');
      expect(Interview.create).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should return an interview by ID', async () => {
      // Make the request
      const response = await request(app)
        .get(`/api/interviews/${mockInterview._id}`)
        .set('Authorization', `Bearer ${mockToken}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(Interview.findById).toHaveBeenCalledWith(mockInterview._id);
    });

    it('should return 404 if interview not found', async () => {
      // Mock models to return null
      Interview.findById.mockResolvedValueOnce(null);
      
      // Make the request
      const response = await request(app)
        .get(`/api/interviews/nonexistentid`)
        .set('Authorization', `Bearer ${mockToken}`);

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Interview not found');
    });
  });

  describe('PUT /:id', () => {
    it('should update an interview', async () => {
      // Modified interview with updated meeting link
      const updatedInterview = {
        ...mockInterview,
        meetingLink: 'https://meet.test.com/updated'
      };
      
      // Mock models
      Interview.findById.mockResolvedValueOnce({
        ...mockInterview,
        save: jest.fn().mockResolvedValue(updatedInterview)
      });
      
      // Make the request
      const response = await request(app)
        .put(`/api/interviews/${mockInterview._id}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ meetingLink: 'https://meet.test.com/updated' });

      // Assertions
      expect(response.status).toBe(200);
      expect(Interview.findById).toHaveBeenCalledWith(mockInterview._id);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete an interview', async () => {
      // Make the request
      const response = await request(app)
        .delete(`/api/interviews/${mockInterview._id}`)
        .set('Authorization', `Bearer ${mockToken}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Interview deleted successfully');
      expect(Interview.findByIdAndDelete).toHaveBeenCalledWith(mockInterview._id);
    });

    it('should return 404 if interview not found during deletion', async () => {
      // Mock models to return null
      Interview.findByIdAndDelete.mockResolvedValueOnce(null);
      
      // Make the request
      const response = await request(app)
        .delete(`/api/interviews/${mockInterview._id}`)
        .set('Authorization', `Bearer ${mockToken}`);

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Interview not found');
    });
  });
}); 