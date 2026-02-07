const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const validate = require('../middleware/validate');
const schemas = require('../schema/comment');
const authenticate = require('../middleware/authentication');

// All comment routes require authentication
router.use(authenticate);

// Create comment
router.post('/', validate(schemas.createCommentSchema), commentController.createComment);

// Get all comments (with optional postId filter)
router.get('/', validate(schemas.getAllCommentsSchema), commentController.getAllComments);

// Get comment by ID
router.get('/:id', commentController.getCommentById);

// Update comment (author only)
router.patch('/:id', validate(schemas.updateCommentSchema), commentController.updateComment);

// Delete comment (author or post author)
router.delete('/:id', commentController.deleteComment);

module.exports = router;
