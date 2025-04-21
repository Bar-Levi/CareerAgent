const unsubscribeUser = require('../../../controllers/mailNotificationsController');
const JobSeeker = require('../../../models/jobSeekerModel');
const Recruiter = require('../../../models/recruiterModel');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');

// Mock models and libraries
jest.mock('../../../models/jobSeekerModel');
jest.mock('../../../models/recruiterModel');
jest.mock('crypto-js');
jest.mock('bcryptjs');

describe('Mail Notifications Controller - unsubscribeUser', () => {
  let mockRequest;
  let mockResponse;
  let mockStatus;
  let mockJson;
  let mockUser;
  const testEmail = 'test@example.com';
  const validPin = '123456';
  const encryptedPin = 'encryptedPin123';
  const hashedPin = 'hashedPinAbc';

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson }));
    mockResponse = { status: mockStatus };
    mockRequest = {
      body: {
        email: testEmail,
        pin: encryptedPin,
      },
    };

    // Mock user object with a save method
    mockUser = {
      email: testEmail,
      pin: hashedPin,
      isSubscribed: true,
      save: jest.fn().mockResolvedValue(this),
    };

    // Reset mocks
    JobSeeker.findOne.mockReset();
    Recruiter.findOne.mockReset();
    CryptoJS.AES.decrypt.mockReset();
    CryptoJS.enc.Utf8 = { toString: jest.fn() }; // Mock nested property
    bcrypt.compare.mockReset();
    mockUser.save.mockClear();

    // Default mock implementations
    CryptoJS.AES.decrypt.mockReturnValue({ toString: jest.fn().mockReturnValue(validPin) });
    bcrypt.compare.mockResolvedValue(true);
    JobSeeker.findOne.mockResolvedValue(null); // Default: not found in JobSeeker
    Recruiter.findOne.mockResolvedValue(null); // Default: not found in Recruiter

    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore(); // Restore console.error
  });

  it('should return 400 if email or pin is missing', async () => {
    mockRequest.body = {};
    await unsubscribeUser(mockRequest, mockResponse);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Email and pin are required.' });
  });

  it('should return 404 if user not found in either model', async () => {
    await unsubscribeUser(mockRequest, mockResponse);
    expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: testEmail });
    expect(Recruiter.findOne).toHaveBeenCalledWith({ email: testEmail });
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ message: 'User not found.' });
  });

  it('should return 200 if user is already unsubscribed', async () => {
    mockUser.isSubscribed = false;
    JobSeeker.findOne.mockResolvedValueOnce(mockUser);

    await unsubscribeUser(mockRequest, mockResponse);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ message: 'You are already unsubscribed.' });
  });

  it('should return 400 if decrypted pin is not 6 digits', async () => {
    CryptoJS.AES.decrypt.mockReturnValue({ toString: jest.fn().mockReturnValue('123') });
    JobSeeker.findOne.mockResolvedValueOnce(mockUser);

    await unsubscribeUser(mockRequest, mockResponse);
    expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith(encryptedPin, process.env.SECRET_KEY);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ message: 'PIN must be a 6-digit number.' });
  });

  it('should return 401 if pin does not match', async () => {
    bcrypt.compare.mockResolvedValueOnce(false);
    JobSeeker.findOne.mockResolvedValueOnce(mockUser);

    await unsubscribeUser(mockRequest, mockResponse);
    expect(bcrypt.compare).toHaveBeenCalledWith(validPin, hashedPin);
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Invalid pin.' });
  });

  it('should successfully unsubscribe a JobSeeker', async () => {
    JobSeeker.findOne.mockResolvedValueOnce(mockUser);

    await unsubscribeUser(mockRequest, mockResponse);

    expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: testEmail });
    expect(Recruiter.findOne).not.toHaveBeenCalled();
    expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith(encryptedPin, process.env.SECRET_KEY);
    expect(bcrypt.compare).toHaveBeenCalledWith(validPin, hashedPin);
    expect(mockUser.isSubscribed).toBe(false);
    expect(mockUser.save).toHaveBeenCalledTimes(1);
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Successfully unsubscribed.' });
  });

  it('should successfully unsubscribe a Recruiter', async () => {
    Recruiter.findOne.mockResolvedValueOnce(mockUser);

    await unsubscribeUser(mockRequest, mockResponse);

    expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: testEmail });
    expect(Recruiter.findOne).toHaveBeenCalledWith({ email: testEmail });
    expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith(encryptedPin, process.env.SECRET_KEY);
    expect(bcrypt.compare).toHaveBeenCalledWith(validPin, hashedPin);
    expect(mockUser.isSubscribed).toBe(false);
    expect(mockUser.save).toHaveBeenCalledTimes(1);
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Successfully unsubscribed.' });
  });

  it('should return 500 if an error occurs during the process', async () => {
    const error = new Error('Something went wrong');
    JobSeeker.findOne.mockRejectedValueOnce(error);

    await unsubscribeUser(mockRequest, mockResponse);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Server error.' });
    expect(console.error).toHaveBeenCalledWith("Error in unsubscribeUser controller:", error);
  });
}); 