const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    followerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    followingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

// Compound unique index to prevent duplicate follows
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Indexes for efficient querying
followSchema.index({ followerId: 1 });
followSchema.index({ followingId: 1 });

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;
