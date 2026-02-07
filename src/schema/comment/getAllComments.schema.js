const Joi = require('joi');

const getAllCommentsQuery = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    postId: Joi.string().hex().length(24).optional().messages({
        'string.hex': 'Invalid post ID format',
        'string.length': 'Invalid post ID format'
    })
});

const getAllCommentsSchema = {
    query: getAllCommentsQuery
};

module.exports = getAllCommentsSchema;
