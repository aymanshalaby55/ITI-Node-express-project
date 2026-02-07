const Follow = require('../models/follow.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const notificationService = require('./notification.service');

const followUser = async (followerId, followingId) => {
    if (!mongoose.isValidObjectId(followingId)) {
        throw new APIError('Invalid user ID', 400);
    }

    if (followerId === followingId) {
        throw new APIError('You cannot follow yourself', 400);
    }

    // Check if user to follow exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
        throw new APIError('User not found', 404);
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ followerId, followingId });
    if (existingFollow) {
        throw new APIError('You are already following this user', 400);
    }

    const follow = await Follow.create({ followerId, followingId });

    // Get follower info and create notification
    const follower = await User.findById(followerId);
    notificationService.createFollowNotification(
        followingId,
        followerId,
        follower.name
    ).catch(err => console.error('Failed to create follow notification:', err.message));
    
    return { 
        message: 'Successfully followed user',
        follow 
    };
};

const unfollowUser = async (followerId, followingId) => {
    if (!mongoose.isValidObjectId(followingId)) {
        throw new APIError('Invalid user ID', 400);
    }

    const follow = await Follow.findOneAndDelete({ followerId, followingId });
    
    if (!follow) {
        throw new APIError('You are not following this user', 400);
    }

    return { message: 'Successfully unfollowed user' };
};

const getFollowers = async (userId, query = {}) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new APIError('Invalid user ID', 400);
    }

    let { page = 1, limit = 10 } = query;
    page = Number(page);
    limit = Number(limit);

    const followersPromise = Follow.find({ followingId: userId })
        .populate('followerId', 'name email profilePicture')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPromise = Follow.countDocuments({ followingId: userId });
    const [followers, total] = await Promise.all([followersPromise, totalPromise]);

    return {
        followers: followers.map(f => f.followerId),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getFollowing = async (userId, query = {}) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new APIError('Invalid user ID', 400);
    }

    let { page = 1, limit = 10 } = query;
    page = Number(page);
    limit = Number(limit);

    const followingPromise = Follow.find({ followerId: userId })
        .populate('followingId', 'name email profilePicture')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPromise = Follow.countDocuments({ followerId: userId });
    const [following, total] = await Promise.all([followingPromise, totalPromise]);

    return {
        following: following.map(f => f.followingId),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getFollowCounts = async (userId) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new APIError('Invalid user ID', 400);
    }

    const [followersCount, followingCount] = await Promise.all([
        Follow.countDocuments({ followingId: userId }),
        Follow.countDocuments({ followerId: userId })
    ]);

    return { followersCount, followingCount };
};

const isFollowing = async (followerId, followingId) => {
    if (!mongoose.isValidObjectId(followingId)) {
        throw new APIError('Invalid user ID', 400);
    }

    const follow = await Follow.findOne({ followerId, followingId });
    return { isFollowing: !!follow };
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowCounts,
    isFollowing
};
