const Joi = require('joi');

const forgotPasswordBody = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
}).required();

const forgotPasswordSchema = {
    body: forgotPasswordBody
};

module.exports = forgotPasswordSchema;
