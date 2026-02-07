const Joi = require('joi');

const getLikesCountQuery = Joi.object({
    targetType: Joi.string().valid('Post', 'Comment').required().messages({
        'any.only': 'Target type must be either Post or Comment',
        'any.required': 'Target type is required'
    }),
    targetId: Joi.string().hex().length(24).required().messages({
        'string.hex': 'Invalid target ID format',
        'string.length': 'Invalid target ID format',
        'any.required': 'Target ID is required'
    })
});

const getLikesCountSchema = {
    query: getLikesCountQuery
};

module.exports = getLikesCountSchema;
