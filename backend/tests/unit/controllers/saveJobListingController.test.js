const { saveJobListing, unsaveJobListing } = require('../../../controllers/saveJobListingController');
const JobSeeker = require('../../../models/jobSeekerModel');

// Mock the JobSeeker model
jest.mock('../../../models/jobSeekerModel');

describe('Save Job Listing Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockStatus;
  let mockJson;

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
    // Reset mocks before each test
    JobSeeker.findByIdAndUpdate.mockClear();
  });

  describe('saveJobListing', () => {
    it('should save a job and return 200', async () => {
      JobSeeker.findByIdAndUpdate.mockResolvedValueOnce({}); // Mock successful update

      await saveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', { $addToSet: { savedJobListings: 'mockJobId' } });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Job saved successfully' });
    });

    it('should return 500 if database update fails', async () => {
      const error = new Error('Database error');
      JobSeeker.findByIdAndUpdate.mockRejectedValueOnce(error);

      // Mock console.error to prevent actual logging during tests
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await saveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', { $addToSet: { savedJobListings: 'mockJobId' } });
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving job:', error);

      consoleErrorSpy.mockRestore(); // Restore original console.error
    });
  });

  describe('unsaveJobListing', () => {
    it('should unsave a job and return 200', async () => {
      JobSeeker.findByIdAndUpdate.mockResolvedValueOnce({}); // Mock successful update

      await unsaveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', { $pull: { savedJobListings: 'mockJobId' } });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Job removed from saved' });
    });

    it('should return 500 if database update fails', async () => {
      const error = new Error('Database error');
      JobSeeker.findByIdAndUpdate.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await unsaveJobListing(mockRequest, mockResponse);

      expect(JobSeeker.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', { $pull: { savedJobListings: 'mockJobId' } });
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error removing saved job:', error);

      consoleErrorSpy.mockRestore();
    });
  });
}); 