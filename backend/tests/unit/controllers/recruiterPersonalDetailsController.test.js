const { 
  updateRecruiterPersonalDetails, 
  resetRecruiterPersonalDetails 
} = require('../../../controllers/recruiterPersonalDetailsController');
const Recruiter = require('../../../models/recruiterModel');

// Mock dependencies
jest.mock('../../../models/recruiterModel');

describe('Recruiter Personal Details Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock a basic recruiter
    const mockRecruiter = {
      _id: 'recruiter123',
      email: 'test@example.com',
      fullName: 'Test Recruiter',
      dateOfBirth: new Date('1990-01-01'),
      companyWebsite: 'https://company.com',
      set: jest.fn(),
      save: jest.fn().mockResolvedValue(true)
    };

    // Default findOne implementation
    Recruiter.findOne = jest.fn().mockResolvedValue(mockRecruiter);
  });

  describe('updateRecruiterPersonalDetails', () => {
    it('should update date of birth successfully', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'dob',
        value: '1995-05-15'
      };
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(Recruiter.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Date of birth updated successfully.'
      }));
      
      // Verify the recruiter.set was called with the correct values
      const mockRecruiter = await Recruiter.findOne();
      expect(mockRecruiter.set).toHaveBeenCalledWith(
        'dateOfBirth', 
        expect.any(Date), 
        { strict: false }
      );
    });

    it('should update company website successfully', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'companywebsite',
        value: 'https://newcompany.com'
      };
      
      // Mock recruiter for this test
      const mockRecruiter = {
        email: 'test@example.com',
        companyWebsite: 'https://company.com',
        set: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };
      Recruiter.findOne.mockResolvedValue(mockRecruiter);
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(mockRecruiter.companyWebsite).toBe('https://newcompany.com');
      expect(mockRecruiter.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Company website updated successfully.'
      }));
    });

    it('should handle case-insensitive type values', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'CompanyWebsite', // Mixed case
        value: 'https://newcompany.com'
      };
      
      const mockRecruiter = {
        email: 'test@example.com',
        companyWebsite: 'https://company.com',
        save: jest.fn().mockResolvedValue(true)
      };
      Recruiter.findOne.mockResolvedValue(mockRecruiter);
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(mockRecruiter.companyWebsite).toBe('https://newcompany.com');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if required fields are missing', async () => {
      // Setup - missing type and value
      req.body = { email: 'test@example.com' };
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Email, type, and value are required.' 
      });
    });

    it('should return 404 if recruiter not found', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'dob',
        value: '1995-05-15'
      };
      
      Recruiter.findOne.mockResolvedValue(null);
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recruiter not found.' });
    });

    it('should return 400 for invalid date of birth', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'dob',
        value: 'invalid-date'
      };
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid date of birth.' });
    });

    it('should return 400 for future date of birth', async () => {
      // Setup
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      req.body = {
        email: 'test@example.com',
        type: 'dob',
        value: futureDate.toISOString()
      };
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Date of birth cannot be in the future.' });
    });

    it('should return 400 for invalid company website URL', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'companywebsite',
        value: 'invalid-url'
      };
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid company website URL. It should start with https://.' 
      });
    });

    it('should return 400 for invalid detail type', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'invalid-type',
        value: 'some value'
      };
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid detail type. Valid types: dob, companyWebsite.' 
      });
    });

    it('should handle server errors', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'dob',
        value: '1995-05-15'
      };
      
      Recruiter.findOne.mockRejectedValue(new Error('Database error'));
      
      // Execute
      await updateRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error.' });
    });
  });

  describe('resetRecruiterPersonalDetails', () => {
    it('should reset date of birth to null', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'dob'
      };
      
      const mockRecruiter = {
        email: 'test@example.com',
        dateOfBirth: new Date('1990-01-01'),
        save: jest.fn().mockResolvedValue(true)
      };
      Recruiter.findOne.mockResolvedValue(mockRecruiter);
      
      // Execute
      await resetRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(mockRecruiter.dateOfBirth).toBeNull();
      expect(mockRecruiter.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Date of birth reset successfully.'
      }));
    });

    it('should reset company website to empty string', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'companywebsite'
      };
      
      const mockRecruiter = {
        email: 'test@example.com',
        companyWebsite: 'https://company.com',
        save: jest.fn().mockResolvedValue(true)
      };
      Recruiter.findOne.mockResolvedValue(mockRecruiter);
      
      // Execute
      await resetRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(mockRecruiter.companyWebsite).toBe('');
      expect(mockRecruiter.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Company website reset successfully.'
      }));
    });

    it('should return 400 if required fields are missing', async () => {
      // Setup - missing type
      req.body = { email: 'test@example.com' };
      
      // Execute
      await resetRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Email and type are required.' 
      });
    });

    it('should return 404 if recruiter not found', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'dob'
      };
      
      Recruiter.findOne.mockResolvedValue(null);
      
      // Execute
      await resetRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Recruiter not found.' });
    });

    it('should return 400 for invalid detail type', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'invalid-type'
      };
      
      // Execute
      await resetRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Invalid detail type. Valid types: dob, companyWebsite.' 
      });
    });

    it('should handle server errors', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        type: 'dob'
      };
      
      Recruiter.findOne.mockRejectedValue(new Error('Database error'));
      
      // Execute
      await resetRecruiterPersonalDetails(req, res);
      
      // Verify
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error.' });
    });
  });
}); 