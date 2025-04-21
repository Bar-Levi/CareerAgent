const { 
  saveJobListing,
  getAllJobListings,
  getJobListingById,
  updateJobListing,
  deleteJobListing,
  getJobListingsByRecruiterId,
  filterActiveJobListings,
  getMetrics,
  getRecruiterListings
} = require('../../../controllers/jobListingController');
const JobListing = require('../../../models/jobListingModel');
const Applicant = require('../../../models/applicantModel');
const JobSeeker = require('../../../models/jobSeekerModel');
const Conversation = require('../../../models/conversationModel');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../../../models/jobListingModel');
jest.mock('../../../models/applicantModel');
jest.mock('../../../models/jobSeekerModel');
jest.mock('../../../models/conversationModel');
jest.mock('../../../utils/jobHelpers', () => ({
  removeJobAndNotify: jest.fn().mockImplementation((id, action) => {
    if (action === 'remove') {
      return Promise.resolve({ _id: id, title: 'Mocked job' });
    }
    return Promise.reject({ message: 'Job listing not found' });
  })
}));

// Mock getMetricsByRecruiterId function
jest.mock('../../../utils/metricsUtils', () => ({
  getMetricsByRecruiterId: jest.fn().mockResolvedValue({
    totalJobListings: 5,
    activeJobListings: 3,
    pausedJobListings: 1,
    closedJobListings: 1,
    totalApplications: 20,
    applicantsByStatus: [
      { _id: 'pending', count: 10 },
      { _id: 'reviewed', count: 5 },
      { _id: 'rejected', count: 3 },
      { _id: 'accepted', count: 2 }
    ]
  })
}));

// Mock the notifyRelevantJobSeekers function
jest.mock('../../../controllers/jobListingController', () => {
  const originalModule = jest.requireActual('../../../controllers/jobListingController');
  return {
    ...originalModule,
    notifyRelevantJobSeekers: jest.fn().mockResolvedValue(true)
  };
});

describe('Job Listing Controller', () => {
  let req, res;
  const mockJobListing = {
    _id: 'joblisting123',
    jobRole: 'Software Engineer',
    company: 'Tech Co',
    location: 'Remote',
    experienceLevel: 'Mid-Level',
    jobType: 'Full-Time',
    remote: 'Yes',
    recruiter: 'recruiter123',
    recruiterId: 'recruiter123',
    recruiterName: 'John Recruiter',
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
    description: 'Job description text',
    responsibilities: ['Code', 'Test', 'Debug'],
    requirements: ['JavaScript', 'React', 'Node.js'],
    status: 'Active',
    save: jest.fn().mockResolvedValue(true)
  };

  beforeEach(() => {
    req = {
      body: {
        jobRole: 'Software Engineer',
        company: 'Tech Co',
        location: 'Remote',
        experienceLevel: 'Mid-Level',
        jobType: 'Full-Time',
        remote: 'Yes',
        recruiter: 'recruiter123',
        recruiterId: 'recruiter123',
        recruiterName: 'John Recruiter',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: 'Job description text',
        responsibilities: ['Code', 'Test', 'Debug'],
        requirements: ['JavaScript', 'React', 'Node.js']
      },
      params: { id: 'joblisting123', recruiterId: 'recruiter123' },
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock JobListing constructor
    JobListing.mockImplementation(function(data) {
      return {
        ...mockJobListing,
        ...data,
        save: jest.fn().mockResolvedValue({ ...mockJobListing, ...data })
      };
    });
  });

  describe('saveJobListing', () => {
    it('should create and return a new job listing', async () => {
      // Execute
      await saveJobListing(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Job listing successfully created.',
        jobListing: expect.any(Object)
      }));
    });

    it('should handle errors when saving job listing', async () => {
      // Setup mock to throw error
      const mockSaveError = new Error('Validation failed');
      const mockJobListingInstance = {
        ...mockJobListing,
        save: jest.fn().mockRejectedValue(mockSaveError)
      };
      
      // Use a custom implementation for this test only
      JobListing.mockImplementationOnce(() => mockJobListingInstance);
      
      // Execute
      await saveJobListing(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Internal Server Error',
        error: expect.any(String)
      }));
    });
  });

  describe('getAllJobListings', () => {
    it('should return all job listings', async () => {
      // Setup mocks
      JobListing.find.mockResolvedValue([mockJobListing]);
      
      // Execute
      await getAllJobListings(req, res);
      
      // Assert
      expect(JobListing.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Job listings fetched successfully.',
        jobListings: expect.any(Array)
      }));
    });

    it('should handle errors when fetching job listings', async () => {
      // Setup mock to throw error
      JobListing.find.mockRejectedValue(new Error('Database error'));
      
      // Execute
      await getAllJobListings(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Internal Server Error',
        error: expect.any(String)
      }));
    });
  });

  describe('getJobListingById', () => {
    it('should return a job listing by id', async () => {
      // Setup mocks
      JobListing.findById.mockResolvedValue(mockJobListing);
      
      // Execute
      await getJobListingById(req, res);
      
      // Assert
      expect(JobListing.findById).toHaveBeenCalledWith('joblisting123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Job listing fetched successfully.',
        jobListing: expect.any(Object)
      }));
    });

    it('should return 404 if job listing not found', async () => {
      // Setup mock to return null
      JobListing.findById.mockResolvedValue(null);
      
      // Execute
      await getJobListingById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: expect.stringContaining('not found')
      }));
    });
  });

  describe('updateJobListing', () => {
    it('should update and return the job listing', async () => {
      // Setup mocks
      const updatedJobListing = {
        ...mockJobListing,
        jobRole: 'Senior Software Engineer',
        recruiterId: 'recruiter123'
      };
      
      // Fix: Properly mock findByIdAndUpdate to return the updated job
      JobListing.findByIdAndUpdate.mockResolvedValue(updatedJobListing);
      
      // Mock JobSeeker.updateMany to avoid test failures
      JobSeeker.updateMany = jest.fn().mockResolvedValue({});
      
      req.body = { jobRole: 'Senior Software Engineer' };
      
      // Execute
      await updateJobListing(req, res);
      
      // Assert
      expect(JobListing.findByIdAndUpdate).toHaveBeenCalledWith(
        'joblisting123', 
        expect.any(Object),
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Job listing updated successfully.',
        jobListing: expect.any(Object),
        metrics: expect.any(Object)
      }));
    });

    it('should return 404 if job listing not found during update', async () => {
      // Setup mock to return null
      JobListing.findByIdAndUpdate.mockResolvedValue(null);
      
      // Execute
      await updateJobListing(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Job listing not found.'
      }));
    });
  });

  describe('deleteJobListing', () => {
    it('should delete the job listing and return success message', async () => {
      // Setup mocks
      const removeJobAndNotify = require('../../../utils/jobHelpers').removeJobAndNotify;
      
      // Execute
      await deleteJobListing(req, res);
      
      // Assert
      expect(removeJobAndNotify).toHaveBeenCalledWith('joblisting123', 'remove');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('deleted successfully')
      }));
    });

    it('should return 404 if job listing not found during deletion', async () => {
      // Setup mock to reject with not found error
      const removeJobAndNotify = require('../../../utils/jobHelpers').removeJobAndNotify;
      removeJobAndNotify.mockRejectedValueOnce({ message: 'Job listing not found' });
      
      // Execute
      await deleteJobListing(req, res);
      
      // Assert
      expect(removeJobAndNotify).toHaveBeenCalledWith('joblisting123', 'remove');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not found')
      }));
    });
  });

  describe('getJobListingsByRecruiterId', () => {
    it('should return job listings for a specific recruiter', async () => {
      // Setup mocks
      JobListing.find.mockResolvedValue([mockJobListing]);
      
      // Execute
      await getJobListingsByRecruiterId(req, res);
      
      // Assert
      expect(JobListing.find).toHaveBeenCalledWith({ recruiterId: 'recruiter123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Job listings fetched successfully.',
        jobListings: expect.any(Array)
      }));
    });
  });

  describe('filterActiveJobListings', () => {
    it('should return filtered active job listings', async () => {
      // Setup query parameters
      req.query = {
        search: 'software',
        location: 'remote',
        sortBy: 'newest'
      };
      
      // Mock the find and sort implementation to return mockJobListing
      JobListing.find.mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockJobListing])
      }));
      
      // Execute
      await filterActiveJobListings(req, res);
      
      // Assert
      expect(JobListing.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Job listings fetched successfully.',
        jobListings: expect.any(Object)
      }));
    });
  });

  describe('getMetrics', () => {
    it('should return metrics for a recruiter', async () => {
      // Setup for mocking metrics
      const { getMetricsByRecruiterId } = require('../../../utils/metricsUtils');
      
      // Execute
      await getMetrics(req, res);
      
      // Assert
      expect(getMetricsByRecruiterId).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        metrics: expect.any(Object)
      }));
    });
  });
}); 