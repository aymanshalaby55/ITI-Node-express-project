const Joi = require('joi');

const schedulePostBody = Joi.object({
    publishAt: Joi.date().iso().greater('now').required().messages({
        'date.greater': 'Scheduled date must be in the future',
        'any.required': 'Publish date is required'
    })
}).required();

const schedulePostParams = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        'string.hex': 'Invalid post ID format',
        'string.length': 'Invalid post ID format',
        'any.required': 'Post ID is required'
    })
});

const schedulePostSchema = {
    body: schedulePostBody,
    params: schedulePostParams
};

module.exports = schedulePostSchema;
