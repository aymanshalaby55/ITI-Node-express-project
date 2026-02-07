const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    type: { 
        type: String, 
        enum: ['comment', 'like', 'follow', 'reply'], 
        required: true 
    },
    relatedUserId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    relatedPostId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post',
        default: null
    },
    relatedCommentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment',
        default: null
    },
    read: { 
        type: Boolean, 
        default: false,
        index: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Compound indexes for efficient querying
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
