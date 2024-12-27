const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { registerJobSeeker } = require('../../controllers/authController');
const JobSeeker = require('../../models/jobSeekerModel');
const { sendVerificationCode } = require('../../utils/emailService');

jest.mock('../../utils/emailService'); // Mock email service

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('AuthController - registerJobSeeker', () => {
    afterEach(async () => {
        await JobSeeker.deleteMany(); // Clear the database after each test
        jest.clearAllMocks();
    });

    it(
        'should register a new job seeker',
        async () => {
            const req = {
                body: {
                    fullName: 'Liam Levi',
                    email: 'liam.levi@newborn.com',
                    password: 'password123',
                    phone: '1234567890',
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            sendVerificationCode.mockResolvedValue(); // Mock sending email

            await registerJobSeeker(req, res);

            const createdUser = await JobSeeker.findOne({ email: req.body.email });

            expect(createdUser).toBeTruthy();
            expect(createdUser.fullName).toBe(req.body.fullName);
            expect(sendVerificationCode).toHaveBeenCalledWith(
                req.body.email,
                req.body.fullName,
                expect.any(Number)
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Registration successful. Verification code sent to email.',
            });
        },
        10000 // 10-second timeout
    );
});
