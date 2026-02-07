const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, getPostById, updatePost, deletePost, uploadPostImages, deletePostImage, searchPosts, getDrafts, publishPost, schedulePost, incrementViewCount } = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const bookmarkController = require('../controllers/bookmark.controller');
const validate = require('../middleware/validate');
const schemas = require('../schema/post');
const authenticate = require('../middleware/authentication');
const restrictTo = require('../middleware/restrictTo');
const { uploadPostImages: uploadMiddleware } = require('../middleware/upload');
const { uploadLimiter, createLimiter } = require('../middleware/rateLimtter');

router.use(authenticate);

// Search posts (must be before /:id to avoid conflict)
router.get('/search', validate(schemas.searchPostsSchema), searchPosts);

// Drafts route (must be before /:id)
router.get('/drafts', getDrafts);

router.post('/', createLimiter, validate(schemas.createPostSchema), createPost);
router.get('/', validate(schemas.getAllPostsSchema), getAllPosts);
router.get('/:id', getPostById);
router.patch('/:id', validate(schemas.updatePostSchema), updatePost);
router.delete('/:id', deletePost);

// Publish, schedule, and view routes
router.post('/:id/publish', publishPost);
router.post('/:id/schedule', validate(schemas.schedulePostSchema), schedulePost);
router.post('/:id/view', incrementViewCount);

// Post images routes with upload rate limiter
router.post('/:id/images', uploadLimiter, uploadMiddleware, uploadPostImages);
router.delete('/:id/images/:imageId', deletePostImage);

// Bookmark routes
router.post('/:postId/bookmark', bookmarkController.addBookmark);
router.delete('/:postId/bookmark', bookmarkController.removeBookmark);
router.get('/:postId/bookmark/check', bookmarkController.checkIsBookmarked);

// Get comments for a specific post
router.get('/:postId/comments', commentController.getCommentsByPost);

module.exports = router;