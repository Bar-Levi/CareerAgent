const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const supertest = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const JobSeeker = require('../../../models/jobSeekerModel');
const Applicant = require('../../../models/applicantModel');
const app = express();

// Setup middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load routes
const jobSeekerPersonalDetailsRoutes = require('../../../routes/jobSeekerPersonalDetailsRoutes');
app.use('/api/jobSeekerPersonalDetails', jobSeekerPersonalDetailsRoutes);

// Default test environment
process.env.JWT_SECRET = 'test-jwt-secret';

let mongoServer;
let jobSeeker;
let token;

// Increase timeout for all tests in this file
jest.setTimeout(60000);

beforeAll(async () => {
  // Start a new MongoDB memory server specifically for this test file
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database only for this test suite
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Create test job seeker with password and subscription status
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Test123!', salt);
  
  jobSeeker = await JobSeeker.create({
    fullName: 'Test User',
    email: 'test@example.com',
    password: hashedPassword,
    role: 'JobSeeker',
    isVerified: true,
    isSubscribed: true,
    numOfApplicationsSent: 10,
    numOfInterviewsScheduled: 5,
    numOfReviewedApplications: 8
  });

  // Generate JWT token for authentication
  token = jwt.sign(
    { id: jobSeeker._id, email: jobSeeker.email, role: jobSeeker.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clean up any data created during tests, but don't wait too long
  try {
    await Applicant.deleteMany({});
  } catch (error) {
    console.log('Error during afterEach cleanup:', error.message);
  }
});

afterAll(async () => {
  // Disconnect from the database and stop the server
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Job Seeker Personal Details Routes', () => {
  describe('GET /api/jobSeekerPersonalDetails/statistics', () => {
    it('should get job seeker statistics successfully', async () => {
      const response = await supertest(app)
        .get('/api/jobSeekerPersonalDetails/statistics')
        .query({ email: jobSeeker.email })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('numOfApplicationsSent', 10);
      expect(response.body).toHaveProperty('numOfInterviewsScheduled', 5);
      expect(response.body).toHaveProperty('numOfReviewedApplications', 8);
      expect(response.body).toHaveProperty('interviewSuccessRate', 62.5); // (5/8)*100
    });

    it('should return 401 if not authenticated', async () => {
      const response = await supertest(app)
        .get('/api/jobSeekerPersonalDetails/statistics')
        .query({ email: jobSeeker.email });

      expect(response.status).toBe(401);
    });

    it('should return 404 if job seeker not found', async () => {
      const response = await supertest(app)
        .get('/api/jobSeekerPersonalDetails/statistics')
        .query({ email: 'nonexistent@example.com' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Job seeker not found.');
    });

    it('should return 400 if email is not provided', async () => {
      const response = await supertest(app)
        .get('/api/jobSeekerPersonalDetails/statistics')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email is required.');
    });
  });

  describe('PUT /api/jobSeekerPersonalDetails/subscribeOrUnsubscribe', () => {
    it('should toggle subscription status successfully', async () => {
      // Initial state is subscribed (true)
      expect(jobSeeker.isSubscribed).toBe(true);

      // Unsubscribe
      const unsubscribeResponse = await supertest(app)
        .put('/api/jobSeekerPersonalDetails/subscribeOrUnsubscribe')
        .send({ email: jobSeeker.email })
        .set('Authorization', `Bearer ${token}`);

      expect(unsubscribeResponse.status).toBe(200);
      expect(unsubscribeResponse.body.message).toBe('Successfully unsubscribed from notifications.');

      // Verify DB was updated
      const updatedJobSeeker = await JobSeeker.findOne({ email: jobSeeker.email });
      expect(updatedJobSeeker.isSubscribed).toBe(false);

      // Subscribe again
      const subscribeResponse = await supertest(app)
        .put('/api/jobSeekerPersonalDetails/subscribeOrUnsubscribe')
        .send({ email: jobSeeker.email })
        .set('Authorization', `Bearer ${token}`);

      expect(subscribeResponse.status).toBe(200);
      expect(subscribeResponse.body.message).toBe('Successfully subscribed to notifications.');

      // Verify DB was updated again
      const finalJobSeeker = await JobSeeker.findOne({ email: jobSeeker.email });
      expect(finalJobSeeker.isSubscribed).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await supertest(app)
        .put('/api/jobSeekerPersonalDetails/subscribeOrUnsubscribe')
        .send({ email: jobSeeker.email });

      expect(response.status).toBe(401);
    });

    it('should return 400 if email is not provided', async () => {
      const response = await supertest(app)
        .put('/api/jobSeekerPersonalDetails/subscribeOrUnsubscribe')
        .send({})
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email is required.');
    });

    it('should return 404 if user not found', async () => {
      const response = await supertest(app)
        .put('/api/jobSeekerPersonalDetails/subscribeOrUnsubscribe')
        .send({ email: 'nonexistent@example.com' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found.');
    });
  });
}); 