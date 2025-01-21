const { protect } = require('../../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('jsonwebtoken'); // Mock JWT for testing
jest.mock('../../models/BlacklistedTokenModel', () => ({
  findOne: jest.fn(),
}));

const BlacklistedToken = require('../../models/BlacklistedTokenModel');

describe('AuthMiddleware - protect', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  afterAll(() => {
    jest.restoreAllMocks(); // Restore mocks after the test suite
  });

  it('should allow access with a valid and non-blacklisted token', async () => {
    const req = {
      header: jest.fn().mockReturnValue('Bearer validToken'),
    };
    const res = {};
    const next = jest.fn();

    // Mock valid token and non-blacklisted status
    jwt.verify.mockReturnValue({ id: '12345' });
    BlacklistedToken.findOne.mockResolvedValue(null);

    // Call middleware
    await protect(req, res, next);

    // Assertions
    expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
    expect(BlacklistedToken.findOne).toHaveBeenCalledWith({ token: 'validToken' });
    expect(req.user).toEqual({ id: '12345' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 for missing token', async () => {
    const req = { header: jest.fn().mockReturnValue(null) };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Call middleware
    await protect(req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Token is missing.' });
    expect(next).not.toHaveBeenCalled(); // Ensure next() is not called
  });

  it('should restrict access for a user with an invalid token', async () => {
    const req = { header: jest.fn().mockReturnValue('Bearer invalidToken') };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Mock token verification failure
    jwt.JsonWebTokenError = class extends Error {
      constructor(message) {
        super(message);
        this.name = 'JsonWebTokenError';
      }
    };

    jwt.verify.mockImplementation(() => {
      throw new jwt.JsonWebTokenError('Invalid token');
    });

    // Call middleware
    await protect(req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token.' });
    expect(next).not.toHaveBeenCalled(); // Ensure next() is not called
  });

  it('should restrict access when token is not provided in the Authorization header', async () => {
    const req = { header: jest.fn().mockReturnValue(undefined) }; // No Authorization header
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Call middleware
    await protect(req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Token is missing.' });
    expect(next).not.toHaveBeenCalled(); // Ensure next() is not called
  });

});
