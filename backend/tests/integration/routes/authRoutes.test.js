const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const { app, server } = require('../../../server');
const JobSeeker = require('../../../models/jobSeekerModel');
const Recruiter = require('../../../models/recruiterModel');
const BlacklistedToken = require('../../../models/BlacklistedTokenModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cleanupTask } = require('../../../tasks/cleanupTokens');
const CryptoJS = require('crypto-js');

// Set a default secret key for testing if not already set
process.env.SECRET_KEY = process.env.SECRET_KEY || 'testSecretKey';

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany().catch((err) => console.error('Error clearing database:', err));
  }
});

afterAll(async () => {
  if (cleanupTask && cleanupTask.stop) {
    cleanupTask.stop();
    console.log('Stopped cleanup task for authRoutes tests.');
  }
  await mongoose.disconnect();
  await mongoServer.stop();
  jest.restoreAllMocks();
});

describe('Auth Routes', () => {
  it('should register a job seeker', async () => {
    const secretKey = process.env.SECRET_KEY;
    const encryptedPassword = CryptoJS.AES.encrypt('Password123', secretKey).toString();
    const encryptedPin = CryptoJS.AES.encrypt('123456', secretKey).toString();

    const response = await request(app).post('/api/auth/registerJobSeeker').send({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: encryptedPassword,
      phone: '1234567890',
      pin: encryptedPin,
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Registration successful. Verification code sent to email.');
  });

  it('should log in a user', async () => {
    const secretKey = process.env.SECRET_KEY;
    // Create a job seeker with plain text password that is then hashed
    const jobSeeker = new JobSeeker({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'JobSeeker',
      isVerified: true,
    });
    await jobSeeker.save();

    // Encrypt the plain text password before sending the login request
    const encryptedPassword = CryptoJS.AES.encrypt('password123', secretKey).toString();

    const response = await request(app).post('/api/auth/login').send({
      email: 'john.doe@example.com',
      password: encryptedPassword,
      role: 'JobSeeker',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('_id');
    expect(response.body.user.email).toBe('john.doe@example.com');
    expect(response.body.user.isVerified).toBe(true);
  });
});
