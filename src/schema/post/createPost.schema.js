const Joi = require('joi');

const createPostSchema = Joi.object({
    title: Joi.string().required().min(3).max(200),
    content: Joi.string().required().min(10).max(255),
    author: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    published: Joi.boolean().default(false),
});

const schema = {
    body: createPostSchema,
}

module.exports = schema;