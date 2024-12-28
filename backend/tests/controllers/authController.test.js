const { MongoMemoryServer } = require('mongodb-memory-server'); // In-memory MongoDB server
const mongoose = require('mongoose'); // MongoDB ODM
const {
    registerJobSeeker,
    registerRecruiter,
    loginUser,
    verifyCode,
    resendVerificationCode,
    requestPasswordReset,
    resetPassword,
} = require('../../controllers/authController'); // Controller functions
const JobSeeker = require('../../models/jobSeekerModel'); // JobSeeker model
const Recruiter = require('../../models/recruiterModel'); // Recruiter model
const { sendVerificationCode } = require('../../utils/emailService'); // Email utility

jest.mock('../../utils/emailService'); // Mock the email service

let mongoServer;

// Setup and teardown for in-memory MongoDB
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('AuthController', () => {
    afterEach(async () => {
        await JobSeeker.deleteMany();
        await Recruiter.deleteMany();
        jest.clearAllMocks();
    });

    // Test: Register a job seeker
    it('should register a new job seeker', async () => {
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
        sendVerificationCode.mockResolvedValue();

        await registerJobSeeker(req, res);

        const createdUser = await JobSeeker.findOne({ email: req.body.email });
        expect(createdUser).toBeTruthy();
        expect(createdUser.fullName).toBe(req.body.fullName);
        expect(sendVerificationCode).toHaveBeenCalledWith(req.body.email, req.body.fullName, expect.any(Number));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Registration successful. Verification code sent to email.',
        });
    });

    // Test: Register a recruiter
    it('should register a new recruiter', async () => {
        const req = {
            body: {
                fullName: 'Jane Smith',
                email: 'jane.smith@company.com',
                password: 'securepassword',
                companyName: 'Tech Innovations',
                companySize: '51-200',
                companyWebsite: 'https://techinnovations.com',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        sendVerificationCode.mockResolvedValue();

        await registerRecruiter(req, res);

        const createdRecruiter = await Recruiter.findOne({ email: req.body.email });
        expect(createdRecruiter).toBeTruthy();
        expect(createdRecruiter.fullName).toBe(req.body.fullName);
        expect(sendVerificationCode).toHaveBeenCalledWith(req.body.email, req.body.fullName, expect.any(Number));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Registration successful. Verification code sent to email.',
        });
    });

    // Test: Login
    it('should log in a user with valid credentials', async () => {
        // Create a user with hashed password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);
    
        await JobSeeker.create({
            fullName: 'Liam Levi',
            email: 'liam.levi@newborn.com',
            password: hashedPassword, // Store hashed password
            phone: '1234567890',
            isVerified: true,
        });
    
        const req = {
            body: {
                email: 'liam.levi@newborn.com',
                password: 'password123',
                role: 'jobseeker',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        await loginUser(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            token: expect.any(String),
            message: 'Login successful.',
        });
    });
    

    // Test: Verify Code
    it('should verify a user with the correct code', async () => {
        const user = await JobSeeker.create({
            fullName: 'Liam Levi',
            email: 'liam.levi@newborn.com',
            password: 'password123',
            verificationCode: 123456,
        });
        const req = { body: { email: user.email, code: 123456, role: 'jobseeker' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await verifyCode(req, res);

        const verifiedUser = await JobSeeker.findOne({ email: user.email });
        expect(verifiedUser.isVerified).toBe(true);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Account verified successfully!',
        });
    });

    // Test: Resend Verification Code
    it('should resend the verification code', async () => {
        const user = await JobSeeker.create({
            fullName: 'Liam Levi',
            email: 'liam.levi@newborn.com',
            password: 'password123',
            verificationCode: 123456,
            verificationCodeSentAt: new Date(), // Temporary value
        });
    
        // Explicitly set the date to one year ago
        user.verificationCodeSentAt = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        await user.save(); // Save the updated user to the database
    
    
        const req = {
            body: {
                email: user.email,
                role: 'jobseeker',
            },
        };
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        sendVerificationCode.mockResolvedValue();
    
        await resendVerificationCode(req, res);
    
        expect(sendVerificationCode).toHaveBeenCalledWith(
            user.email,
            user.fullName,
            expect.any(Number)
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Verification code resent successfully.',
        });
    });
    

    // Test: Request Password Reset
    it('should send a password reset token', async () => {
        const user = await JobSeeker.create({
            fullName: 'Liam Levi',
            email: 'liam.levi@newborn.com',
            password: 'password123',
        });
        const req = { body: { email: user.email } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        sendVerificationCode.mockResolvedValue();

        await requestPasswordReset(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password reset instructions sent to email. Please check your spam folder if the mail didn't arrive in your inbox.",
        });
    });

    // Test: Reset Password
   
it('should reset the user password', async () => {
    const bcrypt = require('bcryptjs');
    const user = await JobSeeker.create({
        fullName: 'Liam Levi',
        email: 'liam.levi@newborn.com',
        password: await bcrypt.hash('password123', 10), // Hash the initial password
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: new Date(),
    });

    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 50000);
    await user.save();

    const req = {
        body: {
            token: 'valid-token',
            newPassword: 'newpassword123',
        },
    };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await resetPassword(req, res);

    const updatedUser = await JobSeeker.findOne({ email: user.email });

    

    // Use bcrypt.compare to validate that the new password was set correctly
    const isPasswordUpdated = await bcrypt.compare('newpassword123', updatedUser.password);
    expect(isPasswordUpdated).toBe(true); // Ensure the new password matches
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        message: 'Password has been successfully reset.',
    });
});

});
