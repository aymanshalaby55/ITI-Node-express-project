const Bookmark = require('../models/bookmark.model');
const Post = require('../models/post.model');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');

const addBookmark = async (userId, postId) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError('Invalid post ID', 400);
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
        throw new APIError('Post not found', 404);
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({ userId, postId });
    if (existingBookmark) {
        throw new APIError('Post is already bookmarked', 400);
    }

    const bookmark = await Bookmark.create({ userId, postId });
    
    return { 
        message: 'Post bookmarked successfully',
        bookmark 
    };
};

const removeBookmark = async (userId, postId) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError('Invalid post ID', 400);
    }

    const bookmark = await Bookmark.findOneAndDelete({ userId, postId });
    
    if (!bookmark) {
        throw new APIError('Bookmark not found', 404);
    }

    return { message: 'Bookmark removed successfully' };
};

const getUserBookmarks = async (userId, query = {}) => {
    let { page = 1, limit = 10 } = query;
    page = Number(page);
    limit = Number(limit);

    const bookmarksPromise = Bookmark.find({ userId })
        .populate({
            path: 'postId',
            select: 'title content author tags status publishedAt views likes images createdAt',
            populate: {
                path: 'author',
                select: 'name email profilePicture'
            }
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPromise = Bookmark.countDocuments({ userId });
    const [bookmarks, total] = await Promise.all([bookmarksPromise, totalPromise]);

    // Filter out null posts (deleted posts)
    const validBookmarks = bookmarks.filter(b => b.postId !== null);

    return {
        bookmarks: validBookmarks.map(b => ({
            bookmarkId: b._id,
            bookmarkedAt: b.createdAt,
            post: b.postId
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const isBookmarked = async (userId, postId) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError('Invalid post ID', 400);
    }

    const bookmark = await Bookmark.findOne({ userId, postId });
    return { isBookmarked: !!bookmark };
};

module.exports = {
    addBookmark,
    removeBookmark,
    getUserBookmarks,
    isBookmarked
};
