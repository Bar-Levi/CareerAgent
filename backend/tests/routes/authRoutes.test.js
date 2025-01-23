const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const JobSeeker = require('../../models/jobSeekerModel');
const bcrypt = require('bcryptjs');
const { cleanupTask } = require('../../tasks/cleanupTokens'); // Import the cron task

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
  if (cleanupTask) cleanupTask.stop(); // Stop the cron task to prevent open handles
  await mongoose.disconnect();
  await mongoServer.stop();
  jest.restoreAllMocks();
});

describe('Auth Routes', () => {
  it('should register a job seeker', async () => {
    const response = await request(app).post('/api/auth/registerJobSeeker').send({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123',
      phone: '1234567890',
      pin: '123456',
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Registration successful. Verification code sent to email.');
  });

  it('should log in a user', async () => {
    const jobSeeker = new JobSeeker({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'jobseeker',
      isVerified: true,
    });
    await jobSeeker.save();

    const response = await request(app).post('/api/auth/login').send({
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'jobseeker',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('_id');
    expect(response.body.user.email).toBe('john.doe@example.com');
    expect(response.body.user.isVerified).toBe(true);
  });
});
