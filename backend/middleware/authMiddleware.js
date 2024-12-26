const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // Extract Bearer token from Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token is missing.' });
    }

    try {
        // Verify token with the secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
        }

        // Generic error response for other errors
        res.status(401).json({ message: 'Unauthorized: Token verification failed.' });
    }
};

module.exports = { protect };
