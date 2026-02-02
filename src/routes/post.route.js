const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, getPostById, updatePost, deletePost } = require('../controllers/post.controller');
const validate = require('../middleware/validate');
const schemas = require('../schema/post');
const authenticate = require('../middleware/authentication');
const restrictTo = require('../middleware/restrictTo');

router.use(authenticate);



router.post('/', validate(schemas.createPostSchema), createPost);
router.get('/', validate(schemas.getAllPostsSchema), getAllPosts);
router.get('/:id', getPostById);
router.patch('/:id', validate(schemas.updatePostSchema), updatePost);
router.delete('/:id', deletePost);

module.exports = router;