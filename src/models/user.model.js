const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'user'], default: 'user' },
    age: { type: Number, required: true, min: 18, max: 150 },
    profilePicture: {
        url: { type: String, default: null },
        fileId: { type: String, default: null },
        filePath: { type: String, default: null }
    },
    // Password reset fields
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null }
}, { timestamps: true });

// Index for password reset token
userSchema.index({ passwordResetToken: 1 });

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before storing
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    // Token expires in 15 minutes
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    
    return resetToken; // Return unhashed token to send via email
};

const User = mongoose.model('User', userSchema);
module.exports = User;
