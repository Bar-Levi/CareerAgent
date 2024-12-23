const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const protect = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract Bearer token

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token is missing.' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // Attach user details to the request
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
    }
};

module.exports = { protect };
