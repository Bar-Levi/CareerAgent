const { 
  createApplicant,
  getApplicants,
  getApplicantById,
  updateApplicant,
  deleteApplicant,
  getRecruiterApplicants,
  getJobSeekerApplicants,
  handleEmailUpdates
} = require('../../../controllers/applicantController');
const Applicant = require('../../../models/applicantModel');
const JobListing = require('../../../models/jobListingModel');
const JobSeeker = require('../../../models/jobSeekerModel');
const Interview = require('../../../models/interviewModel');
const Recruiter = require('../../../models/recruiterModel');
const { 
  sendRejectionEmail, 
  sendHiredEmail, 
  sendApplicationInReviewEmail 
} = require('../../../utils/emailService');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../../../models/applicantModel');
jest.mock('../../../models/jobListingModel');
jest.mock('../../../models/jobSeekerModel');
jest.mock('../../../models/interviewModel');
jest.mock('../../../models/recruiterModel');
jest.mock('../../../utils/emailService');

describe('Applicant Controller', () => {
  let req, res;
  const mockApplicant = {
    _id: 'applicant123',
    jobId: 'joblisting123',
    jobSeekerId: 'jobseeker123',
    recruiterId: 'recruiter123',
    status: 'pending',
    dateApplied: new Date(),
    coverLetter: 'I am interested in this position',
    isPrevApplied: false,
    save: jest.fn().mockResolvedValue(true),
    name: 'Test Applicant',
    email: 'test@example.com',
    profilePic: 'profilepic.jpg',
    cv: 'resume.pdf',
    jobTitle: 'Software Engineer'
  };

  const mockJobListing = {
    _id: 'joblisting123',
    jobRole: 'Software Engineer',
    company: 'Tech Co',
    location: 'Remote',
    recruiter: 'recruiter123',
    recruiterName: 'John Recruiter',
    status: 'Active'
  };

  const mockJobSeeker = {
    _id: 'jobseeker123',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    isEmailNotificationsEnabled: true
  };

  const mockRecruiter = {
    _id: 'recruiter123',
    fullName: 'John Recruiter',
    email: 'john@example.com',
    notifications: [],
    save: jest.fn().mockResolvedValue(true)
  };

  beforeEach(() => {
    req = {
      body: {
        jobId: 'joblisting123',
        jobSeekerId: 'jobseeker123',
        recruiterId: 'recruiter123',
        coverLetter: 'I am interested in this position',
        name: 'Test Applicant',
        email: 'test@example.com',
        cv: 'resume.pdf',
        jobTitle: 'Software Engineer'
      },
      params: { 
        id: 'applicant123', 
        recruiterId: 'recruiter123',
        jobSeekerId: 'jobseeker123' 
      },
      app: {
        get: jest.fn().mockReturnValue({
          to: jest.fn().mockReturnValue({
            emit: jest.fn()
          })
        })
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('createApplicant', () => {
    it('should create and return a new applicant', async () => {
      // Setup mocks
      JobListing.findById.mockResolvedValue(mockJobListing);
      Applicant.findOne.mockResolvedValue(null);
      const savedApplicant = { ...mockApplicant };
      const newApplicant = {
        save: jest.fn().mockResolvedValue(savedApplicant)
      };
      Applicant.mockImplementation(() => newApplicant);
      Recruiter.findById.mockResolvedValue(mockRecruiter);
      JobSeeker.findByIdAndUpdate.mockResolvedValue(true);
      
      // Execute
      await createApplicant(req, res);
      
      // Assert
      expect(newApplicant.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicant created successfully',
        applicant: savedApplicant
      }));
    });

    it('should return 400 if application already exists', async () => {
      // Setup mocks to simulate existing application
      JobListing.findById.mockResolvedValue(mockJobListing);
      Applicant.findOne.mockResolvedValue(mockApplicant);
      
      // Execute
      await createApplicant(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User has already applied for this job.'
      }));
    });

    it('should handle errors when creating applicant', async () => {
      // Setup mock to throw error
      JobListing.findById.mockResolvedValue(mockJobListing);
      Applicant.findOne.mockResolvedValue(null);
      Applicant.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      // Execute
      await createApplicant(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to create applicant'
      }));
    });
  });

  describe('getApplicants', () => {
    it('should return all applicants', async () => {
      // Setup mocks
      const populateMock = jest.fn().mockReturnThis();
      Applicant.find.mockReturnValue({
        populate: populateMock
      });
      populateMock.mockResolvedValue([mockApplicant]);
      
      // Execute
      await getApplicants(req, res);
      
      // Assert
      expect(Applicant.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicants fetched successfully',
        applicants: expect.any(Array)
      }));
    });

    it('should handle errors when fetching applicants', async () => {
      // Setup mock to throw error
      Applicant.find.mockReturnValue({
        populate: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      });
      
      // Execute
      await getApplicants(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to fetch applicants'
      }));
    });
  });

  describe('getApplicantById', () => {
    it('should return an applicant by id', async () => {
      // Setup mocks
      const populateMock = jest.fn().mockReturnThis();
      Applicant.findById.mockReturnValue({
        populate: populateMock
      });
      populateMock.mockResolvedValue(mockApplicant);
      
      // Execute
      await getApplicantById(req, res);
      
      // Assert
      expect(Applicant.findById).toHaveBeenCalledWith('applicant123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicant fetched successfully',
        applicant: expect.anything()
      }));
    });

    it('should return 404 if applicant not found', async () => {
      // Setup mock to return null
      const populateMock = jest.fn().mockReturnThis();
      Applicant.findById.mockReturnValue({
        populate: populateMock
      });
      populateMock.mockResolvedValue(null);
      
      // Execute
      await getApplicantById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicant not found'
      }));
    });
  });

  describe('updateApplicant', () => {
    it('should update and return the applicant', async () => {
      // Setup mocks
      const updatedApplicant = {
        ...mockApplicant,
        status: 'interviewed',
        jobId: { _id: 'joblisting123' }
      };
      
      const populateMock = jest.fn().mockResolvedValue(updatedApplicant);
      Applicant.findByIdAndUpdate.mockReturnValue({
        populate: populateMock
      });
      
      req.body = { status: 'interviewed', interviewId: undefined };
      
      // Execute
      await updateApplicant(req, res);
      
      // Assert
      expect(Applicant.findByIdAndUpdate).toHaveBeenCalledWith(
        'applicant123',
        { status: 'interviewed', interviewId: undefined },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicant updated successfully'
      }));
    });

    it('should return 404 if applicant not found during update', async () => {
      // Setup mock to return null
      const populateMock = jest.fn().mockResolvedValue(null);
      Applicant.findByIdAndUpdate.mockReturnValue({
        populate: populateMock
      });
      
      // Execute
      await updateApplicant(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicant not found'
      }));
    });
  });

  describe('deleteApplicant', () => {
    it('should delete the applicant and return success message', async () => {
      // Setup mocks
      const populateMock = jest.fn().mockResolvedValue(mockApplicant);
      Applicant.findByIdAndDelete.mockReturnValue({
        populate: populateMock
      });
      
      // Execute
      await deleteApplicant(req, res);
      
      // Assert
      expect(Applicant.findByIdAndDelete).toHaveBeenCalledWith('applicant123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicant deleted successfully'
      }));
    });

    it('should return 404 if applicant not found during deletion', async () => {
      // Setup mock to return null
      const populateMock = jest.fn().mockResolvedValue(null);
      Applicant.findByIdAndDelete.mockReturnValue({
        populate: populateMock
      });
      
      // Execute
      await deleteApplicant(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicant not found'
      }));
    });
  });

  describe('getRecruiterApplicants', () => {
    it('should return applicants for a specific recruiter', async () => {
      // Setup mocks
      const populate1 = jest.fn().mockReturnThis();
      const populate2 = jest.fn().mockResolvedValue([mockApplicant]);
      Applicant.find.mockReturnValue({
        populate: populate1
      });
      
      populate1.mockReturnValue({
        populate: populate2
      });
      
      // Execute
      await getRecruiterApplicants(req, res);
      
      // Assert
      expect(Applicant.find).toHaveBeenCalledWith({ recruiterId: 'recruiter123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicants fetched successfully'
      }));
    });
  });

  describe('getJobSeekerApplicants', () => {
    it('should return applicants for a specific job seeker', async () => {
      // Setup mocks with proper chaining
      const populate1 = jest.fn().mockReturnThis();
      const populate2 = jest.fn().mockReturnThis();
      const populate3 = jest.fn().mockResolvedValue([mockApplicant]);
      
      Applicant.find.mockReturnValue({
        populate: populate1
      });
      
      populate1.mockReturnValue({
        populate: populate2
      });
      
      populate2.mockReturnValue({
        populate: populate3
      });
      
      // Execute
      await getJobSeekerApplicants(req, res);
      
      // Assert
      expect(Applicant.find).toHaveBeenCalledWith({ jobSeekerId: 'jobseeker123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Applicants fetched successfully'
      }));
    });

    it('should return 404 if no applicants found for job seeker', async () => {
      // Setup mocks with proper chaining
      const populate1 = jest.fn().mockReturnThis();
      const populate2 = jest.fn().mockReturnThis();
      const populate3 = jest.fn().mockResolvedValue([]);
      
      Applicant.find.mockReturnValue({
        populate: populate1
      });
      
      populate1.mockReturnValue({
        populate: populate2
      });
      
      populate2.mockReturnValue({
        populate: populate3
      });
      
      // Execute
      await getJobSeekerApplicants(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No applicants found for this job seeker'
      }));
    });

    it('should handle errors when fetching job seeker applicants', async () => {
      // Setup mock to throw error
      Applicant.find.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      // Execute
      await getJobSeekerApplicants(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to fetch applicants'
      }));
    });
  });

  describe('handleEmailUpdates', () => {
    beforeEach(() => {
      // Setup request body for email updates
      req.body = {
        status: 'Rejected',
        applicant: {
          _id: 'applicant123',
          email: 'test@example.com',
          name: 'Test Applicant',
          jobId: 'joblisting123',
          jobSeekerId: 'jobseeker123'
        }
      };
      
      // Mock the email service functions
      sendRejectionEmail.mockResolvedValue(true);
      sendHiredEmail.mockResolvedValue(true);
      sendApplicationInReviewEmail.mockResolvedValue(true);
      JobSeeker.findByIdAndUpdate.mockResolvedValue(true);
    });
    
    it('should send rejection email when status is rejected', async () => {
      req.body.status = 'Rejected';
      
      // Execute
      await handleEmailUpdates(req, res);
      
      // Assert
      expect(sendRejectionEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Status logic handled successfully'
      }));
    });

    it('should send hired email when status is hired', async () => {
      req.body.status = 'Hired';
      
      // Execute
      await handleEmailUpdates(req, res);
      
      // Assert
      expect(sendHiredEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Status logic handled successfully'
      }));
    });

    it('should send in-review email when status is in-review', async () => {
      req.body.status = 'In Review';
      
      // Execute
      await handleEmailUpdates(req, res);
      
      // Assert
      expect(sendApplicationInReviewEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Status logic handled successfully'
      }));
    });

    it('should handle errors when processing email updates', async () => {
      // Setup mock to throw error
      sendRejectionEmail.mockRejectedValue(new Error('Email error'));
      
      // Execute
      await handleEmailUpdates(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to handle status logic'
      }));
    });
  });
}); 