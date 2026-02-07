const NotificationService = require('../services/notification.service');

const getUserNotifications = async (req, res) => {
    const { notifications, unreadCount, pagination } = await NotificationService.getUserNotifications(
        req.user.id, 
        req.query
    );
    res.status(200).json({ 
        message: 'Notifications fetched successfully',
        data: notifications,
        unreadCount,
        pagination 
    });
};

const markAsRead = async (req, res) => {
    const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ 
        message: 'Notification marked as read',
        data: notification 
    });
};

const markAllAsRead = async (req, res) => {
    const result = await NotificationService.markAllAsRead(req.user.id);
    res.status(200).json({ message: result.message });
};

const getUnreadCount = async (req, res) => {
    const result = await NotificationService.getUnreadCount(req.user.id);
    res.status(200).json({ 
        message: 'Unread count fetched successfully',
        data: result 
    });
};

module.exports = {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
