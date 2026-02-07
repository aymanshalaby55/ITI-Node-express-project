const Notification = require('../models/notification.model');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');

const createNotification = async (notificationData) => {
    // Don't create notification if user is notifying themselves
    if (notificationData.userId.toString() === notificationData.relatedUserId.toString()) {
        return null;
    }

    const notification = await Notification.create(notificationData);
    return notification;
};

const getUserNotifications = async (userId, query = {}) => {
    let { page = 1, limit = 10, unreadOnly = false } = query;
    page = Number(page);
    limit = Number(limit);

    const filter = { userId };
    if (unreadOnly === 'true' || unreadOnly === true) {
        filter.read = false;
    }

    const notificationsPromise = Notification.find(filter)
        .populate('relatedUserId', 'name email profilePicture')
        .populate('relatedPostId', 'title')
        .populate('relatedCommentId', 'content')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPromise = Notification.countDocuments(filter);
    const unreadCountPromise = Notification.countDocuments({ userId, read: false });

    const [notifications, total, unreadCount] = await Promise.all([
        notificationsPromise,
        totalPromise,
        unreadCountPromise
    ]);

    return {
        notifications,
        unreadCount,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const markAsRead = async (notificationId, userId) => {
    if (!mongoose.isValidObjectId(notificationId)) {
        throw new APIError('Invalid notification ID', 400);
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true },
        { new: true }
    );

    if (!notification) {
        throw new APIError('Notification not found', 404);
    }

    return notification;
};

const markAllAsRead = async (userId) => {
    await Notification.updateMany(
        { userId, read: false },
        { read: true }
    );

    return { message: 'All notifications marked as read' };
};

const getUnreadCount = async (userId) => {
    const count = await Notification.countDocuments({ userId, read: false });
    return { unreadCount: count };
};

// Helper functions to create specific notification types
const createCommentNotification = async (postAuthorId, commenterId, postId, commentId, commenterName, postTitle) => {
    return createNotification({
        userId: postAuthorId,
        type: 'comment',
        relatedUserId: commenterId,
        relatedPostId: postId,
        relatedCommentId: commentId,
        message: `${commenterName} commented on your post "${postTitle}"`
    });
};

const createLikeNotification = async (targetOwnerId, likerId, targetType, targetId, likerName, targetTitle) => {
    const notification = {
        userId: targetOwnerId,
        type: 'like',
        relatedUserId: likerId,
        message: `${likerName} liked your ${targetType.toLowerCase()}`
    };

    if (targetType === 'Post') {
        notification.relatedPostId = targetId;
        notification.message = `${likerName} liked your post "${targetTitle}"`;
    } else {
        notification.relatedCommentId = targetId;
    }

    return createNotification(notification);
};

const createFollowNotification = async (followedUserId, followerId, followerName) => {
    return createNotification({
        userId: followedUserId,
        type: 'follow',
        relatedUserId: followerId,
        message: `${followerName} started following you`
    });
};

const createReplyNotification = async (commentAuthorId, replierId, postId, replyId, replierName) => {
    return createNotification({
        userId: commentAuthorId,
        type: 'reply',
        relatedUserId: replierId,
        relatedPostId: postId,
        relatedCommentId: replyId,
        message: `${replierName} replied to your comment`
    });
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    createCommentNotification,
    createLikeNotification,
    createFollowNotification,
    createReplyNotification
};
