// Set a default secret key for testing if not already set
process.env.SECRET_KEY = process.env.SECRET_KEY || 'testSecretKey';

const CryptoJS = require('crypto-js');
const {
  registerRecruiter,
  registerJobSeeker,
  verifyCode,
  loginUser,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  getUserDetails,
  resetLoginAttempts,
} = require('../../controllers/authController');
const JobSeeker = require('../../models/jobSeekerModel');
const Recruiter = require('../../models/recruiterModel');
const { sendVerificationCode, sendResetPasswordEmail } = require('../../utils/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../models/jobSeekerModel');
jest.mock('../../models/recruiterModel');
jest.mock('../../utils/emailService');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthController Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('registerJobSeeker', () => {
    it('should register a new job seeker with a 6-digit PIN and send a verification code', async () => {
      const secretKey = process.env.SECRET_KEY;
      const encryptedPassword = CryptoJS.AES.encrypt('Password123', secretKey).toString();
      const encryptedPin = CryptoJS.AES.encrypt('123456', secretKey).toString();

      const req = {
        body: {
          fullName: 'John Doe',
          email: 'johndoe@example.com',
          password: encryptedPassword,
          pin: encryptedPin,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      JobSeeker.findOne.mockResolvedValueOnce(null);
      Recruiter.findOne.mockResolvedValueOnce(null);
      JobSeeker.create.mockResolvedValueOnce({
        email: req.body.email,
        fullName: req.body.fullName,
        verificationCode: 123456,
      });
      bcrypt.hash.mockResolvedValue('hashedPassword');

      await registerJobSeeker(req, res);

      expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(JobSeeker.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pin: expect.any(String), // Ensure the PIN is hashed
        })
      );
      expect(sendVerificationCode).toHaveBeenCalledWith(
        req.body.email,
        req.body.fullName,
        expect.any(Number)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Registration successful. Verification code sent to email.',
      });
    });

    it('should return an error if the PIN is not a 6-digit number', async () => {
      const secretKey = process.env.SECRET_KEY;
      const encryptedPassword = CryptoJS.AES.encrypt('password123', secretKey).toString();
      const encryptedPin = CryptoJS.AES.encrypt('123', secretKey).toString();

      const req = {
        body: {
          fullName: 'John Doe',
          email: 'johndoe@example.com',
          password: encryptedPassword,
          pin: encryptedPin, // Invalid PIN
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await registerJobSeeker(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'PIN must be a 6-digit number.',
      });
    });
  });

  describe('verifyCode', () => {
    it('should verify the user with a correct code', async () => {
      const req = {
        body: { email: 'johndoe@example.com', code: '123456', role: 'JobSeeker' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = {
        email: req.body.email,
        verificationCode: 123456,
        save: jest.fn(),
      };

      JobSeeker.findOne.mockResolvedValueOnce(mockUser);

      await verifyCode(req, res);

      expect(mockUser.isVerified).toBeTruthy();
      expect(mockUser.verificationCode).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account verified successfully!' });
    });

    it('should return an error if the code is incorrect', async () => {
      const req = {
        body: { email: 'johndoe@example.com', code: '123456', role: 'JobSeeker' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = { email: req.body.email, verificationCode: 654321, save: jest.fn() };
      JobSeeker.findOne.mockResolvedValueOnce(mockUser);

      await verifyCode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Incorrect verification code.' });
    });
  });

  describe('loginUser', () => {
    it('should log in a verified user with correct credentials', async () => {
      const secretKey = process.env.SECRET_KEY;
      const encryptedPassword = CryptoJS.AES.encrypt('password123', secretKey).toString();
      const req = {
        body: { email: 'johndoe@example.com', password: encryptedPassword, role: 'JobSeeker' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = {
        _id: 'mockUserId',
        email: req.body.email,
        password: 'hashedPassword',
        isVerified: true,
        role: 'JobSeeker',
        loginAttemptsLeft: 7,
        save: jest.fn(),
      };

      JobSeeker.findOne.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('mockToken');

      await loginUser(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser._id, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful.',
        token: 'mockToken',
        user: expect.objectContaining({
          _id: 'mockUserId',
          email: 'johndoe@example.com',
          isVerified: true,
          loginAttemptsLeft: 7,
        }),
      });
    });

    it('should return an error for incorrect password', async () => {
      const secretKey = process.env.SECRET_KEY;
      const encryptedPassword = CryptoJS.AES.encrypt('wrongpassword', secretKey).toString();
      const req = {
        body: { email: 'johndoe@example.com', password: encryptedPassword, role: 'JobSeeker' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = {
        email: req.body.email,
        password: 'hashedPassword',
        loginAttemptsLeft: 3,
        save: jest.fn(),
      };

      JobSeeker.findOne.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: `Incorrect password. You have ${mockUser.loginAttemptsLeft} attempts remaining.`,
      });
    });
  });
});
