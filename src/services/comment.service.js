const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const notificationService = require('./notification.service');
const emailService = require('./email.service');

const MAX_NESTING_DEPTH = 3;

const getCommentDepth = async (parentCommentId) => {
    let depth = 0;
    let currentId = parentCommentId;
    
    while (currentId) {
        const parent = await Comment.findById(currentId);
        if (!parent) break;
        depth++;
        currentId = parent.parentCommentId;
    }
    
    return depth;
};

const createComment = async (commentData, userId) => {
    const { content, postId, parentCommentId } = commentData;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
        throw new APIError('Post not found', 404);
    }

    // Validate nesting depth if it's a reply
    if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
            throw new APIError('Parent comment not found', 404);
        }
        
        // Check if parent comment belongs to the same post
        if (parentComment.postId.toString() !== postId.toString()) {
            throw new APIError('Parent comment does not belong to this post', 400);
        }

        const depth = await getCommentDepth(parentCommentId);
        if (depth >= MAX_NESTING_DEPTH) {
            throw new APIError(`Maximum nesting depth of ${MAX_NESTING_DEPTH} levels exceeded`, 400);
        }
    }

    const comment = await Comment.create({
        content,
        postId,
        userId,
        parentCommentId: parentCommentId || null
    });

    await comment.populate(['userId', 'postId']);

    // Get commenter info for notifications
    const commenter = await User.findById(userId);

    // Create notification for post author (if not commenting on own post)
    if (post.author.toString() !== userId.toString()) {
        notificationService.createCommentNotification(
            post.author,
            userId,
            postId,
            comment._id,
            commenter.name,
            post.title
        ).catch(err => console.error('Failed to create comment notification:', err.message));

        // Send email notification
        const postAuthor = await User.findById(post.author);
        if (postAuthor) {
            emailService.sendCommentNotification(postAuthor, commenter, post, comment)
                .catch(err => console.error('Failed to send comment email:', err.message));
        }
    }

    // If this is a reply, notify the parent comment author
    if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId).populate('userId');
        if (parentComment && parentComment.userId._id.toString() !== userId.toString()) {
            notificationService.createReplyNotification(
                parentComment.userId._id,
                userId,
                postId,
                comment._id,
                commenter.name
            ).catch(err => console.error('Failed to create reply notification:', err.message));

            // Send email notification for reply
            emailService.sendReplyNotification(parentComment.userId, commenter, parentComment, comment)
                .catch(err => console.error('Failed to send reply email:', err.message));
        }
    }

    return comment;
};

const getAllComments = async (query, userId) => {
    let { page = 1, limit = 10, postId } = query;
    page = Number(page);
    limit = Number(limit);

    const filter = {};
    if (postId) {
        if (!mongoose.isValidObjectId(postId)) {
            throw new APIError('Invalid post ID', 400);
        }
        filter.postId = postId;
    }

    const commentsPromise = Comment.find(filter)
        .populate('userId', 'name email')
        .populate('postId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    
    const totalPromise = Comment.countDocuments(filter);
    const [comments, total] = await Promise.all([commentsPromise, totalPromise]);

    const commentsWithOwnership = comments.map(comment => ({
        ...comment.toObject(),
        isOwner: comment.userId?._id?.toString() === userId?.toString()
    }));

    return {
        comments: commentsWithOwnership,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getCommentById = async (id, userId) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new APIError('Invalid comment ID', 400);
    }

    const comment = await Comment.findById(id)
        .populate('userId', 'name email')
        .populate('postId', 'title author');

    if (!comment) {
        throw new APIError('Comment not found', 404);
    }

    return {
        ...comment.toObject(),
        isOwner: comment.userId?._id?.toString() === userId?.toString()
    };
};

const updateCommentById = async (id, commentData, userId) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new APIError('Invalid comment ID', 400);
    }

    const comment = await Comment.findById(id);
    if (!comment) {
        throw new APIError('Comment not found', 404);
    }

    // Only author can update
    if (comment.userId.toString() !== userId.toString()) {
        throw new APIError('You are not authorized to update this comment', 403);
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        id,
        { 
            content: commentData.content,
            isEdited: true,
            editedAt: new Date()
        },
        { new: true }
    ).populate('userId', 'name email').populate('postId', 'title');

    return {
        ...updatedComment.toObject(),
        isOwner: true
    };
};

const deleteCommentById = async (id, userId) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new APIError('Invalid comment ID', 400);
    }

    const comment = await Comment.findById(id).populate('postId', 'author');
    if (!comment) {
        throw new APIError('Comment not found', 404);
    }

    // Author or post author can delete
    const isCommentAuthor = comment.userId.toString() === userId.toString();
    const isPostAuthor = comment.postId?.author?.toString() === userId.toString();

    if (!isCommentAuthor && !isPostAuthor) {
        throw new APIError('You are not authorized to delete this comment', 403);
    }

    // Delete all nested replies
    await Comment.deleteMany({ parentCommentId: id });
    await Comment.findByIdAndDelete(id);

    return { message: 'Comment deleted successfully' };
};

const getCommentsByPost = async (postId, userId, query = {}) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError('Invalid post ID', 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new APIError('Post not found', 404);
    }

    let { page = 1, limit = 10 } = query;
    page = Number(page);
    limit = Number(limit);

    // Get top-level comments only (parentCommentId is null)
    const filter = { postId, parentCommentId: null };

    const commentsPromise = Comment.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    
    const totalPromise = Comment.countDocuments(filter);
    const [comments, total] = await Promise.all([commentsPromise, totalPromise]);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
            const replies = await Comment.find({ parentCommentId: comment._id })
                .populate('userId', 'name email')
                .sort({ createdAt: 1 });

            return {
                ...comment.toObject(),
                isOwner: comment.userId?._id?.toString() === userId?.toString(),
                replies: replies.map(reply => ({
                    ...reply.toObject(),
                    isOwner: reply.userId?._id?.toString() === userId?.toString()
                }))
            };
        })
    );

    return {
        comments: commentsWithReplies,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    createComment,
    getAllComments,
    getCommentById,
    updateCommentById,
    deleteCommentById,
    getCommentsByPost
};
