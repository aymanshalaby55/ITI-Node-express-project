const APIError = require("../utils/APIError");

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new APIError('You are not authorized to access this resource', 403));
        next();
    }
}

module.exports = restrictTo;