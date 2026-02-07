const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true 
    }
}, { timestamps: true });

// Compound unique index to prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

// Indexes for efficient querying
bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ postId: 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
