const Joi = require('joi');

const schema = {
    query: Joi.object({
        page: Joi.number().min(1),
        limit: Joi.number().min(1).max(100),
    }),
}

const getAllPostsSchema = {
    query: Joi.object({
        page: Joi.number().min(1),
        limit: Joi.number().min(1).max(100),
    }),
}

module.exports = getAllPostsSchema;