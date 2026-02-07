const LikeService = require('../services/like.service');

const toggleLike = async (req, res) => {
    const { targetType, targetId } = req.body;
    const result = await LikeService.toggleLike(req.user.id, targetType, targetId);
    res.status(200).json({ 
        message: result.message, 
        data: { liked: result.liked } 
    });
};

const getLikesCount = async (req, res) => {
    const { targetType, targetId } = req.query;
    const result = await LikeService.getLikesCount(targetType, targetId);
    res.status(200).json({ 
        message: 'Likes count fetched successfully', 
        data: result 
    });
};

const checkIfLiked = async (req, res) => {
    const { targetType, targetId } = req.query;
    const result = await LikeService.isLikedByUser(req.user.id, targetType, targetId);
    res.status(200).json({ 
        message: 'Like status checked successfully', 
        data: result 
    });
};

const getUserLikes = async (req, res) => {
    const { userId } = req.params;
    const { likes, pagination } = await LikeService.getUserLikes(userId, req.query);
    res.status(200).json({ 
        message: 'User likes fetched successfully', 
        data: likes, 
        pagination 
    });
};

module.exports = {
    toggleLike,
    getLikesCount,
    checkIfLiked,
    getUserLikes
};
