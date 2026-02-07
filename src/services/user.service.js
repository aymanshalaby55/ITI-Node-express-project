const User = require('../models/user.model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const createJWT = require('../utils/createJWT');
const emailService = require('./email.service');
const APIError = require('../utils/APIError');

const signup = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const createdUser = await User.create({ ...userData, password: hashedPassword });

    const token = createJWT(
        { id: createdUser._id, email: createdUser.email, role: createdUser.role },
    );

    const userWithoutPassword = createdUser.toObject();
   
    delete userWithoutPassword.password;

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(userWithoutPassword).catch(err => {
        console.error('Failed to send welcome email:', err.message);
    });
   
    return { user: userWithoutPassword, token };
}

const login = async (userData) => {
    
    const user = await User.findOne({ email: userData.email });

    if (!user) throw new APIError('User not found', 404);

    const isPasswordCorrect = await bcrypt.compare(userData.password, user.password);
    
    if (!isPasswordCorrect) throw new APIError('Invalid password', 401);
    
    const token = createJWT({ id: user._id, email: user.email, role: user.role });

    return { user, token };
}

const getAllUsers = async (query) => {
    let { page, limit } = query;
    page = Number(page);
    limit = Number(limit);
    const usersPromise = User.find({}, { password: 0 }).skip((page - 1) * limit).limit(limit);
    const totalPromise = User.countDocuments();
    const [users, total] = await Promise.all([usersPromise, totalPromise]);
    const pagenation = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    }
    return { users, pagenation };
}



const getUserById = async (id) => {
    const user = await User.findOne({ _id: id }, { password: 0 });
    if (!user) {
        return null;
    }
    return user;
}


const updateUserById = async (id, userData) => {
    const updatedUser = await User.findOneAndUpdate({ _id: id }, userData, { new: true });
    if (!updatedUser) {
        return null;
    }
    return updatedUser;
}


const deleteUserById = async (id) => {
    const deletedUser = await User.findOneAndDelete({ _id: id });
    if (!deletedUser) {
        return null;
    }
    return deletedUser;
}

const updateProfilePicture = async (userId, imageData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { 
            profilePicture: {
                url: imageData.url,
                fileId: imageData.fileId,
                filePath: imageData.filePath
            }
        },
        { new: true }
    ).select('-password');

    return user;
};

const deleteProfilePicture = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        return null;
    }

    const fileId = user.profilePicture?.fileId;

    await User.findByIdAndUpdate(userId, {
        profilePicture: {
            url: null,
            fileId: null,
            filePath: null
        }
    });

    return { fileId };
};

// Password Reset Functions
const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new APIError('No user found with that email address', 404);
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email (non-blocking)
    try {
        await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (err) {
        // If email fails, clear the reset token
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new APIError('Failed to send password reset email. Please try again later.', 500);
    }

    return { message: 'Password reset email sent successfully' };
};

const resetPassword = async (token, newPassword) => {
    // Hash the token to compare with stored hash
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with valid token that hasn't expired
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new APIError('Token is invalid or has expired', 400);
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email (non-blocking)
    emailService.sendPasswordResetConfirmation(user).catch(err => {
        console.error('Failed to send password reset confirmation email:', err.message);
    });

    return { message: 'Password reset successful' };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new APIError('User not found', 404);
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
        throw new APIError('Current password is incorrect', 401);
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password changed successfully' };
};

const searchUsers = async (query) => {
    let { q, page = 1, limit = 10 } = query;
    page = Number(page);
    limit = Number(limit);

    if (!q || q.trim().length === 0) {
        throw new APIError('Search query is required', 400);
    }

    // Search by name or email using regex (case-insensitive)
    const filter = {
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ]
    };

    const usersPromise = User.find(filter, { password: 0 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalPromise = User.countDocuments(filter);
    const [users, total] = await Promise.all([usersPromise, totalPromise]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = { 
    signup, 
    login, 
    getAllUsers, 
    getUserById, 
    updateUserById, 
    deleteUserById,
    updateProfilePicture,
    deleteProfilePicture,
    forgotPassword,
    resetPassword,
    changePassword,
    searchUsers
};