const Joi = require('joi');

const resetPasswordBody = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'Reset token is required'
    }),
    password: Joi.string().min(8).max(30).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password cannot exceed 30 characters',
        'any.required': 'New password is required'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
    })
}).required();

const resetPasswordSchema = {
    body: resetPasswordBody
};

module.exports = resetPasswordSchema;
