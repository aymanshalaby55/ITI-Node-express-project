const Joi = require('joi');

const updatePostSchema = Joi.object({
    title: Joi.string(),
    content: Joi.string(),
    author: Joi.string(),
    tags: Joi.array().items(Joi.string()),
    published: Joi.boolean(),
});

const updatePostParamsSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
});

const schema = {
    body: updatePostSchema,
    params: updatePostParamsSchema,
}

module.exports = schema;