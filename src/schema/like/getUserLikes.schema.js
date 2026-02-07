const Joi = require('joi');

const getUserLikesParams = Joi.object({
    userId: Joi.string().hex().length(24).required().messages({
        'string.hex': 'Invalid user ID format',
        'string.length': 'Invalid user ID format',
        'any.required': 'User ID is required'
    })
});

const getUserLikesQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    targetType: Joi.string().valid('Post', 'Comment').optional()
});

const getUserLikesSchema = {
    params: getUserLikesParams,
    query: getUserLikesQuery
};

module.exports = getUserLikesSchema;
