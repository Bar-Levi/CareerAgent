const rateLimit = require('express-rate-limit');

// General rate limiter (for sensitive operations)
const generalLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many requests from this IP. Please try again later.',
});

// Strict rate limiter (for very sensitive routes)
const strictLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 minutes
    max: 15, // Limit each IP to 15 requests per windowMs
    message: 'Too many attempts. Please try again later.',
});

// Export limiters
module.exports = {
    generalLimiter,
    strictLimiter,
};  