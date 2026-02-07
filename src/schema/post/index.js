const createPostSchema = require('./createPost.schema.js');
const getAllPostsSchema = require('./getAllPosts.schema.js');
const updatePostSchema = require('./updatePost.schema.js');
const searchPostsSchema = require('./searchPosts.schema.js');
const schedulePostSchema = require('./schedulePost.schema.js');

module.exports = {
    createPostSchema,
    getAllPostsSchema,
    updatePostSchema,
    searchPostsSchema,
    schedulePostSchema
}