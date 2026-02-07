const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const authenticate = require('../middleware/authentication');

router.use(authenticate);

// Follow a user
router.post('/:userId/follow', followController.followUser);

// Unfollow a user
router.delete('/:userId/follow', followController.unfollowUser);

// Get user's followers
router.get('/:userId/followers', followController.getFollowers);

// Get users being followed
router.get('/:userId/following', followController.getFollowing);

// Get follow counts
router.get('/:userId/follow-counts', followController.getFollowCounts);

// Check if current user is following
router.get('/:userId/is-following', followController.checkIsFollowing);

module.exports = router;
