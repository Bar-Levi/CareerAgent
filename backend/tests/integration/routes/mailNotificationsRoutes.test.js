const JobSeeker = require('../../../models/jobSeekerModel');
const Recruiter = require('../../../models/recruiterModel');
const unsubscribeUser = require('../../../controllers/mailNotificationsController');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');

// Increase timeout for this test suite
jest.setTimeout(30000);

// Mock the external dependencies
jest.mock('../../../models/jobSeekerModel');
jest.mock('../../../models/recruiterModel');
jest.mock('crypto-js');
jest.mock('bcryptjs');

describe('Mail Notifications Controller - Unit Tests', () => {
  // Test data
  const testEmail = 'test@example.com';
  const validPin = '123456';
  const encryptedPin = 'encrypted-pin';
  const hashedPin = 'hashed-pin';
  
  let mockReq;
  let mockRes;
  
  beforeAll(() => {
    // Set environment variable for tests
    process.env.SECRET_KEY = 'test-secret-key';
  });
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock request and response objects
    mockReq = {
      body: { email: testEmail, pin: encryptedPin }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Set up common mocks
    CryptoJS.AES.decrypt.mockReturnValue({
      toString: jest.fn().mockReturnValue(validPin)
    });
    
    bcrypt.compare.mockResolvedValue(true);
  });
  
  test('should return 400 if email or pin is missing', async () => {
    // Test without email
    mockReq.body = { pin: encryptedPin };
    await unsubscribeUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Email and pin are required.' });
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Test without pin
    mockReq.body = { email: testEmail };
    await unsubscribeUser(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Email and pin are required.' });
  });
  
  test('should return 404 if user is not found', async () => {
    // Setup mocks for user not found
    JobSeeker.findOne.mockResolvedValueOnce(null);
    Recruiter.findOne.mockResolvedValueOnce(null);
    
    // Reset request body
    mockReq.body = { email: testEmail, pin: encryptedPin };
    
    await unsubscribeUser(mockReq, mockRes);
    
    expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: testEmail });
    expect(Recruiter.findOne).toHaveBeenCalledWith({ email: testEmail });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found.' });
  });
  
  test('should return 200 if user is already unsubscribed', async () => {
    // Setup mocks for already unsubscribed
    const mockUser = {
      email: testEmail,
      isSubscribed: false
    };
    
    JobSeeker.findOne.mockResolvedValueOnce(mockUser);
    
    await unsubscribeUser(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'You are already unsubscribed.' });
  });
  
  test('should return 400 if pin is not 6 digits', async () => {
    // Setup mocks for invalid pin format
    const mockUser = {
      email: testEmail,
      isSubscribed: true,
      pin: hashedPin
    };
    
    JobSeeker.findOne.mockResolvedValueOnce(mockUser);
    
    // Mock pin to be invalid (not 6 digits)
    CryptoJS.AES.decrypt.mockReturnValueOnce({
      toString: jest.fn().mockReturnValue('123')
    });
    
    await unsubscribeUser(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'PIN must be a 6-digit number.' });
  });
  
  test('should return 401 if pin is invalid', async () => {
    // Setup mocks for incorrect pin
    const mockUser = {
      email: testEmail,
      isSubscribed: true,
      pin: hashedPin
    };
    
    JobSeeker.findOne.mockResolvedValueOnce(mockUser);
    bcrypt.compare.mockResolvedValueOnce(false);
    
    await unsubscribeUser(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid pin.' });
  });
  
  test('should unsubscribe JobSeeker successfully', async () => {
    // Setup mocks for successful unsubscribe
    const mockUser = {
      email: testEmail,
      isSubscribed: true,
      pin: hashedPin,
      save: jest.fn().mockResolvedValue({})
    };
    
    JobSeeker.findOne.mockResolvedValueOnce(mockUser);
    
    await unsubscribeUser(mockReq, mockRes);
    
    expect(mockUser.isSubscribed).toBe(false);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Successfully unsubscribed.' });
  });
  
  test('should unsubscribe Recruiter successfully', async () => {
    // Setup mocks for successful unsubscribe
    const mockUser = {
      email: testEmail,
      isSubscribed: true,
      pin: hashedPin,
      save: jest.fn().mockResolvedValue({})
    };
    
    // JobSeeker not found
    JobSeeker.findOne.mockResolvedValueOnce(null);
    
    // Recruiter found
    Recruiter.findOne.mockResolvedValueOnce(mockUser);
    
    await unsubscribeUser(mockReq, mockRes);
    
    expect(mockUser.isSubscribed).toBe(false);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Successfully unsubscribed.' });
  });
  
  test('should return 500 if database error occurs', async () => {
    // Setup mock to simulate database error
    const dbError = new Error('Database connection error');
    JobSeeker.findOne.mockRejectedValueOnce(dbError);
    
    // Mock console.error to avoid polluting test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await unsubscribeUser(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Server error.' });
    expect(console.error).toHaveBeenCalledWith('Error in unsubscribeUser controller:', dbError);
    
    // Restore console.error
    console.error.mockRestore();
  });
}); 