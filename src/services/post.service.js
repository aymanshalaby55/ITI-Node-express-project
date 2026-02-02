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

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost
};