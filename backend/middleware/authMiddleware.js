const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token is missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error Type:', error.name); // Debug log
        console.error('Error Message:', error.message); // Debug log
    
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' }); // Fix here
        }

        return res.status(401).json({ message: 'Unauthorized: Token verification failed.' });
    }
};

module.exports = { protect };
