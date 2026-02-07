const Joi = require('joi');

const searchPostsQuery = Joi.object({
    q: Joi.string().min(1).max(100).required().messages({
        'string.min': 'Search query must be at least 1 character',
        'string.max': 'Search query cannot exceed 100 characters',
        'any.required': 'Search query is required'
    }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    tags: Joi.string().optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional()
});

const searchPostsSchema = {
    query: searchPostsQuery
};

module.exports = searchPostsSchema;
