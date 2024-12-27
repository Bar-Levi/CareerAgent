const { MongoMemoryServer } = require('mongodb-memory-server'); // In-memory MongoDB server for testing
const mongoose = require('mongoose'); // MongoDB ODM
const { registerJobSeeker } = require('../../controllers/authController'); // Controller function to test
const JobSeeker = require('../../models/jobSeekerModel'); // JobSeeker model for database interaction
const { sendVerificationCode } = require('../../utils/emailService'); // Email service utility

jest.mock('../../utils/emailService'); // Mock the email service to avoid sending real emails during testing

let mongoServer; // Variable to hold the in-memory MongoDB instance

// Run before all tests
beforeAll(async () => {
    // Start an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();

    // Get the URI for the in-memory database
    const uri = mongoServer.getUri();

    // Connect Mongoose to the in-memory database
    await mongoose.connect(uri);
});

// Run after all tests
afterAll(async () => {
    // Disconnect Mongoose from the in-memory database
    await mongoose.disconnect();

    // Stop the in-memory MongoDB server
    await mongoServer.stop();
});

// Test suite for AuthController's registerJobSeeker function
describe('AuthController - registerJobSeeker', () => {
    // Run after each test
    afterEach(async () => {
        // Clear the JobSeeker collection to ensure a clean slate for the next test
        await JobSeeker.deleteMany();

        // Clear mock data to avoid cross-test contamination
        jest.clearAllMocks();
    });

    // Test case: Register a new job seeker
    it(
        'should register a new job seeker', // Description of the test case
        async () => {
            // Mock request object
            const req = {
                body: {
                    fullName: 'Liam Levi',
                    email: 'liam.levi@newborn.com',
                    password: 'password123',
                    phone: '1234567890',
                },
            };

            // Mock response object with status and json methods
            const res = {
                status: jest.fn().mockReturnThis(), // Mock response chaining
                json: jest.fn(), // Mock response JSON
            };

            // Mock the email sending service to resolve successfully
            sendVerificationCode.mockResolvedValue();

            // Call the function being tested
            await registerJobSeeker(req, res);

            // Retrieve the user from the database to validate insertion
            const createdUser = await JobSeeker.findOne({ email: req.body.email });

            // Assertions to validate behavior
            expect(createdUser).toBeTruthy(); // Ensure the user was created
            expect(createdUser.fullName).toBe(req.body.fullName); // Ensure the correct name was saved
            expect(sendVerificationCode).toHaveBeenCalledWith(
                req.body.email, // Check email service was called with the correct email
                req.body.fullName, // Check email service was called with the correct name
                expect.any(Number) // Ensure a number (verification code) was passed
            );
            expect(res.status).toHaveBeenCalledWith(201); // Ensure correct HTTP status code
            expect(res.json).toHaveBeenCalledWith({
                message: 'Registration successful. Verification code sent to email.',
            }); // Ensure correct response message
        },
        10000 // Set timeout to 10 seconds for this test
    );
});
