const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true, index: 'text' },
    content: { type: String, required: true, index: 'text' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tags: { type: [String], default: [] },
    status: { 
        type: String, 
        enum: ['draft', 'published', 'scheduled'], 
        default: 'draft' 
    },
    publishedAt: { type: Date, default: null },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    images: [{
        url: { type: String, required: true },
        fileId: { type: String, required: true },
        filePath: { type: String, required: true }
    }]
}, { timestamps: true });

// Text index for search
postSchema.index({ title: 'text', content: 'text' });

// Compound indexes for common queries
postSchema.index({ author: 1, status: 1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ status: 1, publishedAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;