const Like = require('../models/like.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const notificationService = require('./notification.service');

const getTargetModel = (targetType) => {
    switch (targetType) {
        case 'Post':
            return Post;
        case 'Comment':
            return Comment;
        default:
            throw new APIError('Invalid target type', 400);
    }
};

const toggleLike = async (userId, targetType, targetId) => {
    if (!mongoose.isValidObjectId(targetId)) {
        throw new APIError('Invalid target ID', 400);
    }

    // Verify target exists
    const TargetModel = getTargetModel(targetType);
    const target = await TargetModel.findById(targetId);
    if (!target) {
        throw new APIError(`${targetType} not found`, 404);
    }

    // Check if like already exists
    const existingLike = await Like.findOne({ userId, targetType, targetId });

    if (existingLike) {
        // Unlike - remove the like
        await Like.findByIdAndDelete(existingLike._id);
        
        // Decrement likes count on target
        await TargetModel.findByIdAndUpdate(targetId, { $inc: { likes: -1 } });
        
        return { liked: false, message: `${targetType} unliked successfully` };
    } else {
        // Like - create new like
        await Like.create({ userId, targetType, targetId });
        
        // Increment likes count on target
        await TargetModel.findByIdAndUpdate(targetId, { $inc: { likes: 1 } });

        // Create notification for the owner of the liked content
        const liker = await User.findById(userId);
        let ownerId, title;

        if (targetType === 'Post') {
            ownerId = target.author;
            title = target.title;
        } else {
            ownerId = target.userId;
            title = target.content?.substring(0, 50);
        }

        if (ownerId && ownerId.toString() !== userId.toString()) {
            notificationService.createLikeNotification(
                ownerId,
                userId,
                targetType,
                targetId,
                liker.name,
                title
            ).catch(err => console.error('Failed to create like notification:', err.message));
        }
        
        return { liked: true, message: `${targetType} liked successfully` };
    }
};

const getLikesCount = async (targetType, targetId) => {
    if (!mongoose.isValidObjectId(targetId)) {
        throw new APIError('Invalid target ID', 400);
    }

    // Validate target type
    if (!['Post', 'Comment'].includes(targetType)) {
        throw new APIError('Invalid target type', 400);
    }

    const count = await Like.countDocuments({ targetType, targetId });
    return { count };
};

const isLikedByUser = async (userId, targetType, targetId) => {
    if (!mongoose.isValidObjectId(targetId)) {
        throw new APIError('Invalid target ID', 400);
    }

    if (!['Post', 'Comment'].includes(targetType)) {
        throw new APIError('Invalid target type', 400);
    }

    const like = await Like.findOne({ userId, targetType, targetId });
    return { isLiked: !!like };
};

const getUserLikes = async (userId, query = {}) => {
    if (!mongoose.isValidObjectId(userId)) {
        throw new APIError('Invalid user ID', 400);
    }

    let { page = 1, limit = 10, targetType } = query;
    page = Number(page);
    limit = Number(limit);

    const filter = { userId };
    if (targetType && ['Post', 'Comment'].includes(targetType)) {
        filter.targetType = targetType;
    }

    const likesPromise = Like.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    
    const totalPromise = Like.countDocuments(filter);
    const [likes, total] = await Promise.all([likesPromise, totalPromise]);

    // Populate target details
    const populatedLikes = await Promise.all(
        likes.map(async (like) => {
            const TargetModel = getTargetModel(like.targetType);
            const target = await TargetModel.findById(like.targetId)
                .select(like.targetType === 'Post' ? 'title content' : 'content');
            
            return {
                ...like.toObject(),
                target
            };
        })
    );

    return {
        likes: populatedLikes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    toggleLike,
    getLikesCount,
    isLikedByUser,
    getUserLikes
};
