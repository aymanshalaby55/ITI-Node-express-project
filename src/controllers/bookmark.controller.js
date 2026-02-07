const BookmarkService = require('../services/bookmark.service');

const addBookmark = async (req, res) => {
    const result = await BookmarkService.addBookmark(req.user.id, req.params.postId);
    res.status(201).json({ 
        message: result.message,
        data: result.bookmark 
    });
};

const removeBookmark = async (req, res) => {
    const result = await BookmarkService.removeBookmark(req.user.id, req.params.postId);
    res.status(200).json({ message: result.message });
};

const getUserBookmarks = async (req, res) => {
    const { bookmarks, pagination } = await BookmarkService.getUserBookmarks(req.user.id, req.query);
    res.status(200).json({ 
        message: 'Bookmarks fetched successfully',
        data: bookmarks,
        pagination 
    });
};

const checkIsBookmarked = async (req, res) => {
    const result = await BookmarkService.isBookmarked(req.user.id, req.params.postId);
    res.status(200).json({ 
        message: 'Bookmark status checked successfully',
        data: result 
    });
};

module.exports = {
    addBookmark,
    removeBookmark,
    getUserBookmarks,
    checkIsBookmarked
};
