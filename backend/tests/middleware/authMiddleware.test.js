const { protect } = require('../../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken'); // Mock JWT for testing

describe('AuthMiddleware - protect', () => {
    it('should allow access with a valid token', () => {
        const req = {
            header: jest.fn().mockReturnValue('Bearer validToken'),
        };
        const res = {};
        const next = jest.fn();

        // Mock valid token verification
        jwt.verify.mockReturnValue({ id: '12345' });

        // Call middleware
        protect(req, res, next);

        // Assertions
        expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
        expect(req.user).toEqual({ id: '12345' });
        expect(next).toHaveBeenCalled();
    }, 10000);

    it('should return 401 for missing token', () => {
        const req = { header: jest.fn().mockReturnValue(null) };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        // Call middleware
        protect(req, res, next);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Token is missing.' });
    }, 10000);

    it('should restrict access for a user with an invalid token', () => {
        const req = { header: jest.fn().mockReturnValue('Bearer invalidToken') };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();
    
        // Mock the JsonWebTokenError class explicitly
        jwt.JsonWebTokenError = class extends Error {
            constructor(message) {
                super(message);
                this.name = 'JsonWebTokenError';
            }
        };

        // Mock the verify method to throw the specific error
        jwt.verify.mockImplementation(() => {
            throw new jwt.JsonWebTokenError('Invalid token');
        });
        
        // Call middleware
        protect(req, res, next);
    
        // Assertions
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token.' }); // Match specific message
    }, 10000);
    

    it('should restrict access when token is not provided in the Authorization header', () => {
        const req = { header: jest.fn().mockReturnValue(undefined) }; // No Authorization header
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        // Call middleware
        protect(req, res, next);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Token is missing.' });
        expect(next).not.toHaveBeenCalled(); // Ensure next() is not called
    }, 10000);
});
