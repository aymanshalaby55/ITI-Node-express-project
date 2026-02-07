const FollowService = require('../services/follow.service');

const followUser = async (req, res) => {
    const result = await FollowService.followUser(req.user.id, req.params.userId);
    res.status(201).json({ 
        message: result.message,
        data: result.follow 
    });
};

const unfollowUser = async (req, res) => {
    const result = await FollowService.unfollowUser(req.user.id, req.params.userId);
    res.status(200).json({ message: result.message });
};

const getFollowers = async (req, res) => {
    const { followers, pagination } = await FollowService.getFollowers(req.params.userId, req.query);
    res.status(200).json({ 
        message: 'Followers fetched successfully',
        data: followers,
        pagination 
    });
};

const getFollowing = async (req, res) => {
    const { following, pagination } = await FollowService.getFollowing(req.params.userId, req.query);
    res.status(200).json({ 
        message: 'Following fetched successfully',
        data: following,
        pagination 
    });
};

const getFollowCounts = async (req, res) => {
    const counts = await FollowService.getFollowCounts(req.params.userId);
    res.status(200).json({ 
        message: 'Follow counts fetched successfully',
        data: counts 
    });
};

const checkIsFollowing = async (req, res) => {
    const result = await FollowService.isFollowing(req.user.id, req.params.userId);
    res.status(200).json({ 
        message: 'Follow status checked successfully',
        data: result 
    });
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowCounts,
    checkIsFollowing
};
