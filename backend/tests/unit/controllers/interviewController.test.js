const { 
  scheduleInterview,
  getInterviewById,
  updateInterview,
  deleteInterview
} = require('../../../controllers/interviewController');
const Interview = require('../../../models/interviewModel');
const JobListing = require('../../../models/jobListingModel');
const JobSeeker = require('../../../models/jobSeekerModel');
const Recruiter = require('../../../models/recruiterModel');
const Applicant = require('../../../models/applicantModel');
const { sendInterviewScheduledEmailToJobSeeker, sendInterviewScheduledEmailToRecruiter } = require('../../../utils/emailService');

// Mock dependencies
jest.mock('../../../models/interviewModel');
jest.mock('../../../models/jobListingModel');
jest.mock('../../../models/jobSeekerModel');
jest.mock('../../../models/recruiterModel');
jest.mock('../../../models/applicantModel');
jest.mock('../../../utils/emailService');

describe('Interview Controller', () => {
  let req, res, next, mockInterview, mockJobSeeker, mockRecruiter, mockApplicant;

  beforeEach(() => {
    mockInterview = {
      _id: 'interview123',
      participants: [
        { userId: 'jobseeker123', role: 'JobSeeker' },
        { userId: 'recruiter123', role: 'Recruiter' }
      ],
      jobListing: {
        _id: 'joblisting123',
        jobRole: 'Software Engineer',
        company: 'Tech Co',
        location: 'Remote',
        recruiter: 'recruiter123',
        recruiterName: 'John Recruiter',
      },
      scheduledTime: new Date(),
      status: 'scheduled',
      meetingLink: 'https://meet.test.com/123',
      notes: 'Please be prepared to discuss your experience',
      save: jest.fn().mockResolvedValue(true)
    };

    mockJobSeeker = {
      _id: 'jobseeker123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      role: 'jobSeeker',
      notifications: [],
      numOfInterviewsScheduled: 0,
      save: jest.fn().mockResolvedValue(true)
    };

    mockRecruiter = {
      _id: 'recruiter123',
      fullName: 'John Recruiter',
      email: 'john@example.com',
      role: 'recruiter',
      save: jest.fn().mockResolvedValue(true)
    };

    mockApplicant = {
      _id: 'applicant123',
      status: 'Applied',
      save: jest.fn().mockResolvedValue(true)
    };

    req = {
      params: { id: 'interview123' },
      body: {
        applicantId: 'applicant123',
        participants: [
          { userId: 'jobseeker123', role: 'JobSeeker' },
          { userId: 'recruiter123', role: 'Recruiter' }
        ],
        jobListing: mockInterview.jobListing,
        scheduledTime: '2023-04-15T10:00:00Z',
        meetingLink: 'https://meet.test.com/123'
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
    
    next = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock findById for all models
    JobSeeker.findById = jest.fn().mockResolvedValue(mockJobSeeker);
    Recruiter.findById = jest.fn().mockResolvedValue(mockRecruiter);
    Applicant.findById = jest.fn().mockResolvedValue(mockApplicant);
    Interview.create = jest.fn().mockResolvedValue(mockInterview);
  });

  describe('scheduleInterview', () => {
    it('should create and return a new interview', async () => {
      // Execute
      await scheduleInterview(req, res);
      
      // Assert
      expect(Interview.create).toHaveBeenCalled();
      expect(JobSeeker.findById).toHaveBeenCalledWith('jobseeker123');
      expect(mockJobSeeker.save).toHaveBeenCalled();
      expect(sendInterviewScheduledEmailToJobSeeker).toHaveBeenCalled();
      expect(sendInterviewScheduledEmailToRecruiter).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Interview scheduled successfully",
        interview: mockInterview
      });
    });

    it('should return 400 for invalid input', async () => {
      // Setup - remove participants to make request invalid
      req.body.participants = [];
      
      // Execute
      await scheduleInterview(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: "At least two participants and scheduledTime are required" 
      });
    });

    it('should handle errors when scheduling interview', async () => {
      // Setup - make Interview.create throw an error
      const error = new Error('Database error');
      Interview.create.mockRejectedValue(error);
      
      // Execute
      await scheduleInterview(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: "Failed to schedule interview", 
        error: error.message 
      });
    });
  });

  describe('getInterviewById', () => {
    it('should return an interview by ID', async () => {
      // Setup
      Interview.findById.mockResolvedValue(mockInterview);
      
      // Execute
      await getInterviewById(req, res);
      
      // Assert
      expect(Interview.findById).toHaveBeenCalledWith('interview123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInterview);
    });

    it('should return 404 if interview not found', async () => {
      // Setup
      Interview.findById.mockResolvedValue(null);
      
      // Execute
      await getInterviewById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Interview not found' });
    });
  });

  describe('updateInterview', () => {
    it('should update and return the interview', async () => {
      // Setup
      const updatedInterview = { ...mockInterview, meetingLink: 'https://meet.test.com/updated' };
      mockInterview.save.mockResolvedValue(updatedInterview);
      Interview.findById.mockResolvedValue(mockInterview);
      req.body = { meetingLink: 'https://meet.test.com/updated' };
      
      // Execute
      await updateInterview(req, res);
      
      // Assert
      expect(Interview.findById).toHaveBeenCalledWith('interview123');
      expect(mockInterview.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedInterview);
    });

    it('should return 404 if interview not found during update', async () => {
      // Setup
      Interview.findById.mockResolvedValue(null);
      
      // Execute
      await updateInterview(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Interview not found' });
    });
    
    it('should handle errors during update', async () => {
      // Setup - make Interview.findById throw an error
      const error = new Error('Database error');
      Interview.findById.mockRejectedValue(error);
      
      // Execute
      await updateInterview(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: "Failed to update interview", 
        error: error.message 
      });
    });
  });

  describe('deleteInterview', () => {
    it('should delete the interview and return success message', async () => {
      // Setup
      Interview.findByIdAndDelete.mockResolvedValue(mockInterview);
      
      // Execute
      await deleteInterview(req, res);
      
      // Assert
      expect(Interview.findByIdAndDelete).toHaveBeenCalledWith('interview123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Interview deleted successfully' });
    });

    it('should return 404 if interview not found during deletion', async () => {
      // Setup
      Interview.findByIdAndDelete.mockResolvedValue(null);
      
      // Execute
      await deleteInterview(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Interview not found' });
    });
    
    it('should handle errors during deletion', async () => {
      // Setup - make Interview.findByIdAndDelete throw an error
      const error = new Error('Database error');
      Interview.findByIdAndDelete.mockRejectedValue(error);
      
      // Execute
      await deleteInterview(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: "Failed to delete interview", 
        error: error.message 
      });
    });
  });
}); 