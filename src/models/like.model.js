const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    targetType: { 
        type: String, 
        enum: ['Post', 'Comment'], 
        required: true 
    },
    targetId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    }
}, { timestamps: true });

// Compound unique index to prevent duplicate likes
likeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for efficient querying
likeSchema.index({ targetType: 1, targetId: 1 });
likeSchema.index({ userId: 1 });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
