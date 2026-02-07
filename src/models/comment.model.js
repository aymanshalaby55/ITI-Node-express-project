const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: true, 
        minlength: 1, 
        maxlength: 1000 
    },
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true,
        index: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    parentCommentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment', 
        default: null,
        index: true
    },
    likes: { 
        type: Number, 
        default: 0 
    },
    isEdited: { 
        type: Boolean, 
        default: false 
    },
    editedAt: { 
        type: Date, 
        default: null 
    }
}, { timestamps: true });

// Compound index for efficient querying
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
