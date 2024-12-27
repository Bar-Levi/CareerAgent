const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app'); // Ensure this points to your app file
const JobSeeker = require('../../models/jobSeekerModel'); // Import the model
const bcrypt = require('bcryptjs');

let mongoServer;

beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect(); // Close any existing connections
    }
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    // Clear the database after each test
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
        await collection.deleteMany();
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth Routes', () => {
    it('should register a job seeker', async () => {
        const response = await request(app).post('/api/auth/registerJobSeeker').send({
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            password: 'password123',
            phone: '1234567890',
        });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Registration successful. Verification code sent to email.');
    });

    it('should log in a user', async () => {
        // Pre-create and verify a job seeker
        const jobSeeker = new JobSeeker({
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            password: await bcrypt.hash('password123', 10), // Hash the password
            role: 'jobseeker',
            isVerified: true, // Ensure the account is verified
        });
        await jobSeeker.save();

        const response = await request(app).post('/api/auth/login').send({
            email: 'john.doe@example.com',
            password: 'password123',
            role: 'jobseeker',
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
});
