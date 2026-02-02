const postService = require('../services/post.service');

const createPost = async (req, res) => {
    const { title, content, author, tags, published } = req.body;
    const userId = req.user.id;
    try {
        const post = await postService.createPost({ title, content, author: userId, tags, published });
        res.status(201).json({ message: "Post created successfully", data: post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllPosts = async (req, res) => {
    const { page, limit } = req.query;  
    const userId = req.user.id;
    try {
        const posts = await postService.getAllPosts(userId,page, limit);
        res.status(200).json({ message: "Posts fetched successfully", data: posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPostById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const post = await postService.getPostById(id, userId);
        res.status(200).json({ message: "Post fetched successfully", data: post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePost = async (req, res) => {
    const userId = req.user.id;
    const { title, content, tags, published } = req.body;
    const { id } = req.params;
    try {
        const post = await postService.updatePost(id, userId, { title, content, tags, published });
        res.status(200).json({ message: "Post updated successfully", data: post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePost = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        const post = await postService.deletePost(id, userId);
        res.status(200).json({ message: "Post deleted successfully", data: post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost
};