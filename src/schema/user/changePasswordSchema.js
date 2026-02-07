const Joi = require('joi');

const changePasswordBody = Joi.object({
    currentPassword: Joi.string().required().messages({
        'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(8).max(30).required().messages({
        'string.min': 'New password must be at least 8 characters',
        'string.max': 'New password cannot exceed 30 characters',
        'any.required': 'New password is required'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your new password'
    })
}).required();

const changePasswordSchema = {
    body: changePasswordBody
};

module.exports = changePasswordSchema;
