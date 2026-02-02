const Joi = require('joi');

const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).required();

const loginSchema = {
    body: schema,
}

module.exports = loginSchema;