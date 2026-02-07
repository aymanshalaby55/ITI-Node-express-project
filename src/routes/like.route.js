const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');
const validate = require('../middleware/validate');
const schemas = require('../schema/like');
const authenticate = require('../middleware/authentication');

// Toggle like (authenticated)
router.post('/', authenticate, validate(schemas.toggleLikeSchema), likeController.toggleLike);

// Get likes count (public)
router.get('/count', validate(schemas.getLikesCountSchema), likeController.getLikesCount);

// Check if user liked (authenticated)
router.get('/check', authenticate, validate(schemas.getLikesCountSchema), likeController.checkIfLiked);

// Get all likes by a user
router.get('/users/:userId', authenticate, validate(schemas.getUserLikesSchema), likeController.getUserLikes);

module.exports = router;
