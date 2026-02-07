const postService = require('../services/post.service');
const imageKitService = require('../services/imageKit.service');
const APIError = require('../utils/APIError');

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

const uploadPostImages = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new APIError('No files uploaded', 400);
    }

    const uploadedImages = await imageKitService.uploadMultipleImages(
        req.files,
        `/posts/${req.params.id}`
    );

    const imagesData = uploadedImages.map(img => ({
        url: img.url,
        fileId: img.fileId,
        filePath: img.filePath
    }));

    const post = await postService.addImagesToPost(req.params.id, req.user.id, imagesData);

    res.status(200).json({
        message: 'Images uploaded successfully',
        data: { images: post.images }
    });
};

const deletePostImage = async (req, res) => {
    const { id, imageId } = req.params;
    
    const result = await postService.deletePostImage(id, imageId, req.user.id);

    if (result?.fileId) {
        await imageKitService.deleteImage(result.fileId).catch(err => {
            console.error('Failed to delete image from ImageKit:', err.message);
        });
    }

    res.status(200).json({ message: 'Image deleted successfully' });
};

const searchPosts = async (req, res) => {
    const userId = req.user?.id;
    const result = await postService.searchPosts(req.query, userId);
    res.status(200).json({ 
        message: 'Search results fetched successfully', 
        data: result.posts,
        pagination: result.pagination
    });
};

const getDrafts = async (req, res) => {
    const result = await postService.getDrafts(req.user.id, req.query);
    res.status(200).json({ 
        message: 'Drafts fetched successfully', 
        data: result.posts,
        pagination: result.pagination
    });
};

const publishPost = async (req, res) => {
    const post = await postService.publishPost(req.params.id, req.user.id);
    res.status(200).json({ 
        message: 'Post published successfully', 
        data: post 
    });
};

const schedulePost = async (req, res) => {
    const { publishAt } = req.body;
    const post = await postService.schedulePost(req.params.id, req.user.id, publishAt);
    res.status(200).json({ 
        message: 'Post scheduled successfully', 
        data: post 
    });
};

const incrementViewCount = async (req, res) => {
    const result = await postService.incrementViewCount(req.params.id);
    res.status(200).json({ 
        message: 'View count incremented', 
        data: result 
    });
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    uploadPostImages,
    deletePostImage,
    searchPosts,
    getDrafts,
    publishPost,
    schedulePost,
    incrementViewCount
};