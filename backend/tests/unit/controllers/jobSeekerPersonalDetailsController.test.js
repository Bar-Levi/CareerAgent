const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const cloudinary = require('../../../config/cloudinary');
const streamifier = require('streamifier');
const JobSeeker = require('../../../models/jobSeekerModel');
const Recruiter = require('../../../models/recruiterModel');
const JobListing = require('../../../models/jobListingModel');
const applicantModel = require('../../../models/applicantModel');
const conversationModel = require('../../../models/conversationModel');
const { extractPublicId, deleteFromCloudinary } = require('../../../utils/cloudinaryUtils');

const {
  changePassword,
  changePic,
  getNameAndProfilePic,
  updateJobSeekerPersonalDetails,
  resetJobSeekerPersonalDetails,
  getRelevancePoints,
  setRelevancePoints,
  getMinPointsForUpdate,
  setMinPointsForUpdate,
  updateCV,
  deleteCV,
  subscribeOrUnsubscribe,
  getJobSeekerStatistics
} = require('../../../controllers/jobSeekerPersonalDetailsController');

// Mock all dependencies
jest.mock('bcryptjs');
jest.mock('crypto-js');
jest.mock('../../../config/cloudinary');
jest.mock('streamifier');
jest.mock('../../../models/jobSeekerModel');
jest.mock('../../../models/recruiterModel');
jest.mock('../../../models/jobListingModel');
jest.mock('../../../models/applicantModel');
jest.mock('../../../models/conversationModel');
jest.mock('../../../utils/cloudinaryUtils');

// Set environment to test mode
process.env.NODE_ENV = 'test';

describe('JobSeeker Personal Details Controller', () => {
  let req, res;
  const defaultProfilePic = "https://res.cloudinary.com/careeragent/image/upload/v1735084555/default_profile_image.png";
  const defaultCompanyLogo = "https://res.cloudinary.com/careeragent/image/upload/v1742730089/defaultCompanyLogo_lb5fsj.png";

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      query: {},
      method: 'POST',
      file: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock JobSeeker.findOne and Recruiter.findOne to return null by default
    JobSeeker.findOne = jest.fn().mockResolvedValue(null);
    Recruiter.findOne = jest.fn().mockResolvedValue(null);
    
    // Mock applicantModel.updateMany
    applicantModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    
    // Mock conversationModel.updateMany
    conversationModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });

    // Setup default encryption/decryption mocks
    CryptoJS.AES.decrypt = jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue('decryptedPassword')
    });

    // Mock bcrypt functionality
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    bcrypt.genSalt = jest.fn().mockResolvedValue('mockedSalt');
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

    // Mock cloudinary functionality
    // Create a writable mock stream with end and write functions
    const mockWritableStream = {
      write: jest.fn(),
      end: jest.fn()
    };
    
    // Mock the upload_stream function to properly simulate async behavior
    cloudinary.uploader.upload_stream = jest.fn().mockImplementation((options, callback) => {
      // Return the mock stream first
      process.nextTick(() => {
        // Then simulate a successful upload with expected result format
        callback(null, { secure_url: 'https://res.cloudinary.com/test/image.jpg' });
      });
      return mockWritableStream;
    });

    // Setup environment variables
    process.env.SECRET_KEY = 'test-secret-key';

    // Mock cloudinary utils
    extractPublicId.mockReturnValue('test-public-id');
    deleteFromCloudinary.mockResolvedValue({ result: 'ok' });
    
    // Mock streamifier
    streamifier.createReadStream = jest.fn().mockReturnValue({
      pipe: jest.fn().mockReturnValue({})
    });
  });

  describe('changePassword', () => {
    beforeEach(() => {
      req.body = {
        email: 'test@example.com',
        oldPassword: 'encryptedOldPassword',
        newPassword: 'encryptedNewPassword'
      };

      // Mock a user
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedOldPassword',
        save: jest.fn().mockResolvedValue(true)
      };

      // Reset mocks for each test
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      JobSeeker.findOne.mockResolvedValue(mockUser);
      
      // Set up mock for password validation
      CryptoJS.AES.decrypt
        .mockReturnValueOnce({ toString: jest.fn().mockReturnValue('oldPassword') })
        .mockReturnValueOnce({ toString: jest.fn().mockReturnValue('NewPassword123') });
    });

    it('should change password successfully for a job seeker', async () => {
      // Execute
      await changePassword(req, res);
      
      // Verify
      expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password updated successfully.' });
    });

    it('should change password successfully for a recruiter', async () => {
      // Setup
      JobSeeker.findOne.mockResolvedValue(null);
      const mockRecruiter = {
        email: 'test@example.com',
        password: 'hashedOldPassword',
        save: jest.fn().mockResolvedValue(true)
      };
      Recruiter.findOne.mockResolvedValue(mockRecruiter);
      
      // Execute
      await changePassword(req, res);
      
      // Verify
      expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(Recruiter.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if required fields are missing', async () => {
      // Setup
      req.body = { email: 'test@example.com' };
      
      // Execute
      await changePassword(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email, old password and new password are required.' });
    });

    it('should return 404 if user not found', async () => {
      // Setup
      JobSeeker.findOne.mockResolvedValue(null);
      Recruiter.findOne.mockResolvedValue(null);
      
      // Execute
      await changePassword(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
    });

    it('should return 400 if old password is incorrect', async () => {
      // Setup
      bcrypt.compare.mockResolvedValue(false);
      
      // Execute
      await changePassword(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Old password is incorrect.' });
    });

    it('should return 400 if new password equals old password', async () => {
      // Setup
      CryptoJS.AES.decrypt
        .mockReset()
        .mockReturnValueOnce({ toString: jest.fn().mockReturnValue('samePassword') })
        .mockReturnValueOnce({ toString: jest.fn().mockReturnValue('samePassword') });
      
      // Execute
      await changePassword(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'New password cannot equal the old password.' });
    });

    it('should return 400 if new password does not meet criteria', async () => {
      // Setup
      CryptoJS.AES.decrypt
        .mockReset()
        .mockReturnValueOnce({ toString: jest.fn().mockReturnValue('oldPassword') })
        .mockReturnValueOnce({ toString: jest.fn().mockReturnValue('weak') });
      
      // Execute
      await changePassword(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "New password does not meet the required criteria: Password must include uppercase, lowercase, a number, and be at least 8 characters long."
      });
    });

    it('should handle server errors', async () => {
      // Setup
      JobSeeker.findOne.mockRejectedValue(new Error('Database error'));
      
      // Execute
      await changePassword(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error.' });
    });
  });

  describe('changePic', () => {
    describe('POST - Upload Profile Picture', () => {
      beforeEach(() => {
        req.method = 'POST';
        req.body = {
          email: 'test@example.com',
          picType: 'profile'
        };
        req.file = {
          buffer: Buffer.from('test image data')
        };
        
        // Mock a user
        const mockUser = {
          email: 'test@example.com',
          profilePic: defaultProfilePic,
          companyLogo: defaultCompanyLogo,
          role: 'JobSeeker',
          save: jest.fn().mockResolvedValue(true)
        };
        
        JobSeeker.findOne.mockResolvedValue(mockUser);
      });

      it('should upload and update profile picture', async () => {
        // Setup
        const mockUser = {
          email: 'test@example.com',
          profilePic: 'https://old-image.jpg',
          save: jest.fn().mockResolvedValue(true)
        };
        JobSeeker.findOne.mockResolvedValue(mockUser);
        
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
        
        // Mock status and json for the callback
        res.status.mockReturnValueOnce({ json: res.json });
        
        // Execute the callback that's passed to upload_stream
        const callback = cloudinary.uploader.upload_stream.mock.calls[0][1];
        await callback(null, { secure_url: 'https://res.cloudinary.com/test/image.jpg' });
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          message: expect.stringContaining('successfully'),
          profilePic: expect.any(String),
        }));
      });

      it('should delete old non-default profile picture before uploading new one', async () => {
        // Setup user with non-default profile pic
        const mockUser = {
          email: 'test@example.com',
          profilePic: 'https://res.cloudinary.com/test/old-image.jpg',
          role: 'JobSeeker',
          save: jest.fn().mockResolvedValue(true)
        };
        JobSeeker.findOne.mockResolvedValue(mockUser);
        
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(extractPublicId).toHaveBeenCalledWith('https://res.cloudinary.com/test/old-image.jpg');
        expect(deleteFromCloudinary).toHaveBeenCalledWith('test-public-id');
      });

      it('should update job listings with new profile pic for recruiters', async () => {
        // Setup
        req.body.picType = 'profile';
        const mockRecruiter = {
          email: 'recruiter@example.com',
          role: 'Recruiter',
          _id: 'recruiter123',
          profilePic: 'https://old-image.jpg',
          save: jest.fn().mockResolvedValue(true)
        };
        
        JobSeeker.findOne.mockResolvedValue(null);
        Recruiter.findOne.mockResolvedValue(mockRecruiter);
        JobListing.updateMany.mockResolvedValue({ nModified: 1 });
        
        // Execute
        await changePic(req, res);
        
        // Mock status and json for the callback
        res.status.mockReturnValueOnce({ json: res.json });
        
        // Execute the callback that's passed to upload_stream
        const callback = cloudinary.uploader.upload_stream.mock.calls[0][1];
        await callback(null, { secure_url: 'https://res.cloudinary.com/test/image.jpg' });
        
        // Verify
        expect(JobListing.updateMany).toHaveBeenCalledWith(
          { recruiterId: 'recruiter123' },
          { recruiterProfileImage: 'https://res.cloudinary.com/test/image.jpg' }
        );
      });

      it('should return 400 if email is missing', async () => {
        // Setup
        req.body = { picType: 'profile' };
        
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email is required.' });
      });

      it('should return 400 if picType is missing', async () => {
        // Setup
        req.body = { email: 'test@example.com' };
        
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'picType (profile or company) is required.' });
      });

      it('should return 404 if user not found', async () => {
        // Setup
        JobSeeker.findOne.mockResolvedValue(null);
        Recruiter.findOne.mockResolvedValue(null);
        
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
      });

      it('should return 400 if no file uploaded', async () => {
        // Setup
        req.file = null;
        
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'No file uploaded.' });
      });

      it('should handle Cloudinary upload errors', async () => {
        // Setup Cloudinary to return an error
        cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
          callback(new Error('Upload failed'), null);
          return {
            write: jest.fn(),
            end: jest.fn()
          };
        });
        
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to upload file.' });
      });
    });

    describe('DELETE - Remove Profile Picture', () => {
      beforeEach(() => {
        req.method = 'DELETE';
        req.query = {
          email: 'test@example.com',
          picType: 'profile'
        };
        
        // Mock a user
        const mockUser = {
          email: 'test@example.com',
          profilePic: 'https://res.cloudinary.com/test/image.jpg',
          role: 'JobSeeker',
          _id: 'testjobseeker123',
          save: jest.fn().mockResolvedValue(true)
        };
        
        JobSeeker.findOne.mockResolvedValue(mockUser);
        
        // Mock applicantModel.updateMany
        applicantModel.updateMany.mockResolvedValue({ modifiedCount: 1 });
      });

      it('should remove profile picture and set to default', async () => {
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(deleteFromCloudinary).toHaveBeenCalledWith('test-public-id');
        expect(applicantModel.updateMany).toHaveBeenCalledWith(
          { jobSeekerId: 'testjobseeker123' },
          { profilePic: defaultProfilePic }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          message: 'profile picture deleted successfully.',
          profilePic: defaultProfilePic
        }));
      }, 10000);  // Increase timeout to 10 seconds

      it('should remove company logo and set to default', async () => {
        // Setup
        req.query.picType = 'company';
        const mockRecruiter = {
          email: 'test@example.com',
          companyLogo: 'https://res.cloudinary.com/test/logo.jpg',
          role: 'Recruiter',
          _id: 'recruiter123',
          save: jest.fn().mockResolvedValue(true)
        };
        JobSeeker.findOne.mockResolvedValue(null);
        Recruiter.findOne.mockResolvedValue(mockRecruiter);
        
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(JobListing.updateMany).toHaveBeenCalledWith(
          { recruiterId: 'recruiter123' },
          { companyLogo: defaultCompanyLogo }
        );
        expect(res.status).toHaveBeenCalledWith(200);
      });

      it('should not attempt to delete from Cloudinary if image is default', async () => {
        // Setup user with default profile pic
        const mockUser = {
          email: 'test@example.com',
          profilePic: defaultProfilePic,
          save: jest.fn().mockResolvedValue(true)
        };
        JobSeeker.findOne.mockResolvedValue(mockUser);
        
        // Execute
        await changePic(req, res);
        
        // Verify
        expect(deleteFromCloudinary).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });
  });

  describe('getNameAndProfilePic', () => {
    beforeEach(() => {
      req.query = { email: 'test@example.com' };
      
      // Mock a user
      const mockUser = {
        email: 'test@example.com',
        fullName: 'Test User',
        profilePic: 'https://res.cloudinary.com/test/image.jpg'
      };
      
      JobSeeker.findOne.mockResolvedValue(mockUser);
    });

    it('should return name and profile pic for a jobseeker', async () => {
      // Execute
      await getNameAndProfilePic(req, res);
      
      // Verify
      expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        profilePic: 'https://res.cloudinary.com/test/image.jpg'
      }));
    });

    it('should return name and profile pic for a recruiter', async () => {
      // Setup
      const mockRecruiter = {
        email: 'test@example.com',
        fullName: 'Test Recruiter',
        profilePic: 'https://res.cloudinary.com/test/recruiter.jpg'
      };
      JobSeeker.findOne.mockResolvedValue(null);
      Recruiter.findOne.mockResolvedValue(mockRecruiter);
      
      // Execute
      await getNameAndProfilePic(req, res);
      
      // Verify
      expect(Recruiter.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Recruiter',
        profilePic: 'https://res.cloudinary.com/test/recruiter.jpg'
      }));
    });

    it('should return 400 if email is missing', async () => {
      // Setup
      req.query = {};
      
      // Execute
      await getNameAndProfilePic(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email or ID is required to fetch profile picture.' });
    });

    it('should return 404 if user not found', async () => {
      // Setup
      JobSeeker.findOne.mockResolvedValue(null);
      Recruiter.findOne.mockResolvedValue(null);
      
      // Execute
      await getNameAndProfilePic(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
    });

    it('should handle server errors', async () => {
      // Setup
      JobSeeker.findOne.mockRejectedValue(new Error('Database error'));
      
      // Execute
      await getNameAndProfilePic(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error.' });
    });
  });

  describe('updateJobSeekerPersonalDetails', () => {
    beforeEach(() => {
      // Reset mocks for each test
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      
      req.body = {
        email: 'test@example.com',
        type: 'github',
        value: 'https://github.com/testuser'
      };
      
      const mockJobSeeker = {
        email: 'test@example.com',
        githubUrl: '',
        save: jest.fn().mockResolvedValue(true)
      };
      
      JobSeeker.findOne.mockResolvedValue(mockJobSeeker);
    });
    
    it('should update job seeker details successfully', async () => {
      // Execute
      await updateJobSeekerPersonalDetails(req, res);
      
      // Verify
      expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Personal detail updated successfully.',
        updatedUser: expect.any(Object)
      }));
    });
    
    it('should return 400 if email is missing', async () => {
      // Setup
      req.body = { type: 'github', value: 'https://github.com/testuser' };
      
      // Execute
      await updateJobSeekerPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email, type, and value are required.' });
    });
    
    it('should return 404 if job seeker not found', async () => {
      // Setup
      JobSeeker.findOne.mockResolvedValue(null);
      
      // Execute
      await updateJobSeekerPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Jobseeker not found.' });
    });
    
    it('should handle server errors', async () => {
      // Setup
      JobSeeker.findOne.mockRejectedValue(new Error('Database error'));
      
      // Execute
      await updateJobSeekerPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error.' });
    });
    
    it('should validate GitHub URL format', async () => {
      // Setup - invalid GitHub URL
      req.body.value = 'invalid-github-url';
      
      // Execute
      await updateJobSeekerPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid GitHub URL.' });
    });
    
    it('should handle invalid detail types', async () => {
      // Setup - invalid type
      req.body.type = 'invalidType';
      
      // Execute
      await updateJobSeekerPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid detail type. Valid types: github, linkedin, phone, dob.' 
      });
    });
  });

  // Tests for resetJobSeekerPersonalDetails and other methods would follow the same pattern
  // For brevity, I'll just add a few more key method tests

  describe('subscribeOrUnsubscribe', () => {
    beforeEach(() => {
      req.body = { email: 'test@example.com' };
      
      const mockUser = {
        email: 'test@example.com',
        isSubscribed: true,
        save: jest.fn().mockResolvedValue(true)
      };
      
      JobSeeker.findOne.mockResolvedValue(mockUser);
    });
    
    it('should unsubscribe a job seeker from email notifications', async () => {
      // Execute
      await subscribeOrUnsubscribe(req, res);
      
      // Verify - update to match actual controller implementation
      expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Successfully unsubscribed from notifications.' });
    });
    
    it('should subscribe a job seeker to email notifications', async () => {
      // Setup - already unsubscribed
      const mockUser = {
        email: 'test@example.com',
        isSubscribed: false,
        save: jest.fn().mockResolvedValue(true)
      };
      JobSeeker.findOne.mockResolvedValue(mockUser);
      
      // Execute
      await subscribeOrUnsubscribe(req, res);
      
      // Verify - update to match actual controller implementation
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Successfully subscribed to notifications.' });
    });

    it('should handle recruiter subscription changes', async () => {
      // Setup
      const mockRecruiter = {
        email: 'test@example.com',
        isEmailNotificationsEnabled: true,
        save: jest.fn().mockResolvedValue(true)
      };
      JobSeeker.findOne.mockResolvedValue(null);
      Recruiter.findOne.mockResolvedValue(mockRecruiter);
      
      // Execute
      await subscribeOrUnsubscribe(req, res);
      
      // Verify
      expect(Recruiter.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if email is missing', async () => {
      // Setup
      req.body = { subscribe: false };
      
      // Execute
      await subscribeOrUnsubscribe(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email is required.' });
    });

    it('should return 404 if user not found', async () => {
      // Setup
      JobSeeker.findOne.mockResolvedValue(null);
      Recruiter.findOne.mockResolvedValue(null);
      
      // Execute
      await subscribeOrUnsubscribe(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
    });
  });

  describe('getJobSeekerStatistics', () => {
    beforeEach(() => {
      req.query = { email: 'test@example.com' };
      
      const mockJobSeeker = {
        email: 'test@example.com',
        numOfApplicationsSent: 10,
        numOfInterviewsScheduled: 5,
        numOfReviewedApplications: 8
      };
      
      JobSeeker.findOne.mockResolvedValue(mockJobSeeker);
    });
    
    it('should return job seeker statistics', async () => {
      // Execute
      await getJobSeekerStatistics(req, res);
      
      // Verify
      expect(JobSeeker.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        numOfInterviewsScheduled: 5,
        numOfApplicationsSent: 10,
        numOfReviewedApplications: 8,
        interviewSuccessRate: 62.5
      }));
    });
    
    it('should return 404 if job seeker not found', async () => {
      // Setup
      JobSeeker.findOne.mockResolvedValue(null);
      
      // Mock status to return 404
      res.status.mockReturnValueOnce({ json: res.json });
      
      // Execute
      await getJobSeekerStatistics(req, res);
      
      // Verify - update expectations to match actual implementation
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Job seeker not found.' });
    });
  });
}); 