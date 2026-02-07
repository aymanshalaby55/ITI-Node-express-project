const Joi = require('joi');

const updateCommentBody = Joi.object({
    content: Joi.string().min(1).max(1000).required().messages({
        'string.min': 'Comment content must be at least 1 character',
        'string.max': 'Comment content cannot exceed 1000 characters',
        'any.required': 'Comment content is required'
    })
}).required();

const updateCommentParams = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        'string.hex': 'Invalid comment ID format',
        'string.length': 'Invalid comment ID format',
        'any.required': 'Comment ID is required'
    })
});

const updateCommentSchema = {
    body: updateCommentBody,
    params: updateCommentParams
};

module.exports = updateCommentSchema;
