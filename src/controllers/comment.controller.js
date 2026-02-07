const CommentService = require('../services/comment.service');

const createComment = async (req, res) => {
    const comment = await CommentService.createComment(req.body, req.user.id);
    res.status(201).json({ 
        message: 'Comment created successfully', 
        data: comment 
    });
};

const getAllComments = async (req, res) => {
    const { comments, pagination } = await CommentService.getAllComments(req.query, req.user?.id);
    res.status(200).json({ 
        message: 'Comments fetched successfully', 
        data: comments, 
        pagination 
    });
};

const getCommentById = async (req, res) => {
    const comment = await CommentService.getCommentById(req.params.id, req.user?.id);
    res.status(200).json({ 
        message: 'Comment fetched successfully', 
        data: comment 
    });
};

const updateComment = async (req, res) => {
    const comment = await CommentService.updateCommentById(req.params.id, req.body, req.user.id);
    res.status(200).json({ 
        message: 'Comment updated successfully', 
        data: comment 
    });
};

const deleteComment = async (req, res) => {
    await CommentService.deleteCommentById(req.params.id, req.user.id);
    res.status(200).json({ 
        message: 'Comment deleted successfully' 
    });
};

const getCommentsByPost = async (req, res) => {
    const { comments, pagination } = await CommentService.getCommentsByPost(
        req.params.postId, 
        req.user?.id,
        req.query
    );
    res.status(200).json({ 
        message: 'Comments fetched successfully', 
        data: comments, 
        pagination 
    });
};

module.exports = {
    createComment,
    getAllComments,
    getCommentById,
    updateComment,
    deleteComment,
    getCommentsByPost
};
