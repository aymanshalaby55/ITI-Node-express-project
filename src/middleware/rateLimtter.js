const { rateLimit } = require('express-rate-limit');
const APIError = require('../utils/APIError');

// Base configuration
const baseConfig = {
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    handler: (req, res, next, options) => {
        throw new APIError(options.message || "Too many requests, please try again later.", 429);
    }
};

// General API rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message: "Too many requests, please try again later."
});

// Authentication rate limiter: 5 requests per 15 minutes
const authLimiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    message: "Too many authentication attempts, please try again later."
});

// Password reset rate limiter: 3 requests per hour
const passwordResetLimiter = rateLimit({
    ...baseConfig,
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 3,
    message: "Too many password reset requests, please try again later."
});

// File upload rate limiter: 10 requests per hour
const uploadLimiter = rateLimit({
    ...baseConfig,
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10,
    message: "Too many file uploads, please try again later."
});

// Strict rate limiter for sensitive operations: 10 requests per 15 minutes
const strictLimiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    message: "Too many requests for this operation, please try again later."
});

// API creation limiter: 30 requests per 15 minutes (for creating posts, comments, etc.)
const createLimiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 30,
    message: "Too many creation requests, please try again later."
});

module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    uploadLimiter,
    strictLimiter,
    createLimiter
};