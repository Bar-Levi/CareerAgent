const rateLimit = require('express-rate-limit');

// General rate limiter (for sensitive operations)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many requests from this IP. Please try again later.',
});

// Strict rate limiter (for very sensitive routes)
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many attempts. Please try again later.',
});

// Export limiters
module.exports = {
    generalLimiter,
    strictLimiter,
};  