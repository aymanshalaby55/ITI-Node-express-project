const Post = require('../models/post.model');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');

const createPost = async (postData) => {
    const { title, content, author, tags, published } = postData;

    if (!title || !content || !author) {
        throw new APIError("Title, content, and author are required", 400);
    }

    const post = await Post.create({ title, content, author, tags, published });

    return post;
};

const getAllPosts = async (userId, page = 1, limit = 10) => {
    page = Number(page);
    limit = Number(limit);
    const postsPromise = Post.find({}).skip((page - 1) * limit).limit(limit);
    const totalPromise = Post.countDocuments();
    const [posts, total] = await Promise.all([postsPromise, totalPromise]);
    
    const postsWithOwnership = posts.map(post => ({
        ...post.toObject(),
        isOwner: post.author?.toString() === userId?.toString()
    }));
    
    return {
        posts: postsWithOwnership,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getPostById = async (id, userId) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new APIError("Invalid post ID", 400);
    }
    const post = await Post.findOne({ _id: id });
    if (!post) {
        throw new APIError("Post not found", 404);
    }

    return {
        ...post.toObject(),
        isOwner: post.author?.toString() === userId?.toString()
    };
};

const updatePost = async (postId, userId, updateData) => {
    
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError("Invalid post ID", 400);
    }
    
    const post = await Post.findOne({ _id: postId  });
    
    if (!post) {
        throw new APIError("Post not found", 404);
    }

    if(post.author?.toString() !== userId?.toString()){
        throw new APIError("you are not authorized to update this resource", 401);
    }

    
    
    const { title, content, tags, published } = updateData;

    const updatedPost = await Post.findOneAndUpdate(
        { _id: postId , author: userId },
        { title, content, tags, published }
    , { new: true });

    return updatedPost;
};

const deletePost = async (postId, userId) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError("Invalid post ID", 400);
    }

    const post = await Post.findOne({ _id: postId});
    
    if (!post) {
        throw new APIError("Post not found", 404);
    }

    
    if(post.author?.toString() !== userId?.toString()){
        throw new APIError("you are not authorized to update this resource", 401);
    }


    const deletedPost = await Post.findOneAndDelete({ _id: postId , author: userId });

    return deletedPost;
};

const addImagesToPost = async (postId, userId, imagesData) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError("Invalid post ID", 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new APIError("Post not found", 404);
    }

    if (post.author.toString() !== userId.toString()) {
        throw new APIError("You are not authorized to update this post", 403);
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $push: { images: { $each: imagesData } } },
        { new: true }
    );

    return updatedPost;
};

const deletePostImage = async (postId, imageId, userId) => {
    if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(imageId)) {
        throw new APIError("Invalid ID format", 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new APIError("Post not found", 404);
    }

    if (post.author.toString() !== userId.toString()) {
        throw new APIError("You are not authorized to update this post", 403);
    }

    const image = post.images.id(imageId);
    if (!image) {
        throw new APIError("Image not found", 404);
    }

    const fileId = image.fileId;

    await Post.findByIdAndUpdate(postId, {
        $pull: { images: { _id: imageId } }
    });

    return { fileId };
};

const getDrafts = async (userId, query = {}) => {
    let { page = 1, limit = 10 } = query;
    page = Number(page);
    limit = Number(limit);

    const filter = { author: userId, status: 'draft' };

    const postsPromise = Post.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPromise = Post.countDocuments(filter);
    const [posts, total] = await Promise.all([postsPromise, totalPromise]);

    return {
        posts: posts.map(post => ({ ...post.toObject(), isOwner: true })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const publishPost = async (postId, userId) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError("Invalid post ID", 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new APIError("Post not found", 404);
    }

    if (post.author.toString() !== userId.toString()) {
        throw new APIError("You are not authorized to publish this post", 403);
    }

    if (post.status === 'published') {
        throw new APIError("Post is already published", 400);
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { 
            status: 'published', 
            publishedAt: new Date() 
        },
        { new: true }
    );

    return updatedPost;
};

const schedulePost = async (postId, userId, publishAt) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError("Invalid post ID", 400);
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new APIError("Post not found", 404);
    }

    if (post.author.toString() !== userId.toString()) {
        throw new APIError("You are not authorized to schedule this post", 403);
    }

    const scheduledDate = new Date(publishAt);
    if (scheduledDate <= new Date()) {
        throw new APIError("Scheduled date must be in the future", 400);
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { 
            status: 'scheduled', 
            publishedAt: scheduledDate 
        },
        { new: true }
    );

    return updatedPost;
};

const searchPosts = async (query, userId) => {
    let { q, page = 1, limit = 10, tags, dateFrom, dateTo } = query;
    page = Number(page);
    limit = Number(limit);

    if (!q || q.trim().length === 0) {
        throw new APIError('Search query is required', 400);
    }

    const filter = {
        $text: { $search: q },
        status: 'published'
    };

    // Add tag filter if provided
    if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        filter.tags = { $in: tagArray };
    }

    // Add date range filter if provided
    if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) {
            filter.createdAt.$gte = new Date(dateFrom);
        }
        if (dateTo) {
            filter.createdAt.$lte = new Date(dateTo);
        }
    }

    const postsPromise = Post.find(
        filter,
        { score: { $meta: 'textScore' } }
    )
        .sort({ score: { $meta: 'textScore' } })
        .populate('author', 'name email')
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPromise = Post.countDocuments(filter);
    const [posts, total] = await Promise.all([postsPromise, totalPromise]);

    const postsWithOwnership = posts.map(post => ({
        ...post.toObject(),
        isOwner: post.author?._id?.toString() === userId?.toString()
    }));

    return {
        posts: postsWithOwnership,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const incrementViewCount = async (postId) => {
    if (!mongoose.isValidObjectId(postId)) {
        throw new APIError("Invalid post ID", 400);
    }

    const post = await Post.findByIdAndUpdate(
        postId,
        { $inc: { views: 1 } },
        { new: true }
    );

    if (!post) {
        throw new APIError("Post not found", 404);
    }

    return { views: post.views };
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    addImagesToPost,
    deletePostImage,
    searchPosts,
    getDrafts,
    publishPost,
    schedulePost,
    incrementViewCount
};