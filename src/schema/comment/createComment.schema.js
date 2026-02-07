const Joi = require('joi');

const createCommentBody = Joi.object({
    content: Joi.string().min(1).max(1000).required().messages({
        'string.min': 'Comment content must be at least 1 character',
        'string.max': 'Comment content cannot exceed 1000 characters',
        'any.required': 'Comment content is required'
    }),
    postId: Joi.string().hex().length(24).required().messages({
        'string.hex': 'Invalid post ID format',
        'string.length': 'Invalid post ID format',
        'any.required': 'Post ID is required'
    }),
    parentCommentId: Joi.string().hex().length(24).optional().messages({
        'string.hex': 'Invalid parent comment ID format',
        'string.length': 'Invalid parent comment ID format'
    })
}).required();

const createCommentSchema = {
    body: createCommentBody
};

module.exports = createCommentSchema;
