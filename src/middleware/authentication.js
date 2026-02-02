const jwt = require('jsonwebtoken');
const APIError = require('../utils/APIError');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new APIError('Authentication required. Please provide a valid token', 401));
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return next(new APIError('Authentication required. Please provide a valid token', 401));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new APIError('Invalid token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new APIError('Token has expired', 401));
        }
        return next(new APIError('Authentication failed', 401));
    }
}

module.exports = authenticate;