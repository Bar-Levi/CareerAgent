const { saveJobListing, unsaveJobListing } = require('../../../controllers/saveJobListingController');
const JobSeeker = require('../../../models/jobSeekerModel');

// Mock the JobSeeker model
jest.mock('../../../models/jobSeekerModel');

describe('Save Job Listing Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockStatus;
  let mockJson;
  let mockUpdatedJobSeeker;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson }));
    mockResponse = { status: mockStatus };
    mockRequest = {
      params: {
        userId: 'mockUserId',
        jobId: 'mockJobId',
      },
    };
    
    // Create mock job seeker with savedJobListings
    mockUpdatedJobSeeker = {
      _id: 'mockUserId',
      savedJobListings: ['mockJobId', 'anotherJobId']
    };
    
    // Reset mocks before each test
    JobSeeker.findByIdAndUpdate.mockClear();
  });

  describe('saveJobListing', () => {
    it('should save a job and return 200 with updated savedJobListings', async () => {
      JobSeeker.findByIdAndUpdate.mockResolvedValueOnce(mockUpdatedJobSeeker);

      await saveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId', 
        { $addToSet: { savedJobListings: 'mockJobId' } },
        { new: true }
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Job saved successfully',
        savedJobListings: mockUpdatedJobSeeker.savedJobListings
      });
    });

    it('should return 404 if user is not found', async () => {
      JobSeeker.findByIdAndUpdate.mockResolvedValueOnce(null);

      await saveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId', 
        { $addToSet: { savedJobListings: 'mockJobId' } },
        { new: true }
      );
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 if database update fails', async () => {
      const error = new Error('Database error');
      JobSeeker.findByIdAndUpdate.mockRejectedValueOnce(error);

      // Mock console.error to prevent actual logging during tests
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await saveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId', 
        { $addToSet: { savedJobListings: 'mockJobId' } },
        { new: true }
      );
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving job:', error);

      consoleErrorSpy.mockRestore(); // Restore original console.error
    });
  });

  describe('unsaveJobListing', () => {
    it('should unsave a job and return 200 with updated savedJobListings', async () => {
      // Mock updated jobseeker after removing a job from savedJobListings
      const mockJobSeekerAfterRemoval = {
        _id: 'mockUserId',
        savedJobListings: ['anotherJobId'] // mockJobId removed
      };
      
      JobSeeker.findByIdAndUpdate.mockResolvedValueOnce(mockJobSeekerAfterRemoval);

      await unsaveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId', 
        { $pull: { savedJobListings: 'mockJobId' } },
        { new: true }
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Job removed from saved',
        savedJobListings: mockJobSeekerAfterRemoval.savedJobListings
      });
    });

    it('should return 404 if user is not found', async () => {
      JobSeeker.findByIdAndUpdate.mockResolvedValueOnce(null);

      await unsaveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId', 
        { $pull: { savedJobListings: 'mockJobId' } },
        { new: true }
      );
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 if database update fails', async () => {
      const error = new Error('Database error');
      JobSeeker.findByIdAndUpdate.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await unsaveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId', 
        { $pull: { savedJobListings: 'mockJobId' } },
        { new: true }
      );
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error removing saved job:', error);

      consoleErrorSpy.mockRestore();
    });
  });
}); 