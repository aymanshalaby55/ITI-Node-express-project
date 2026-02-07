const UserService = require('../services/user.service');
const APIError = require('../utils/APIError');
const imageKitService = require('../services/imageKit.service');


const signup = async (req, res) => {
    const user = await UserService.signup(req.body);
    res.status(201).json({ message: "User created successfully", data: user })
}

const login = async (req, res) => {
    const user = await UserService.login(req.body);
    res.status(200).json({ message: "User logged in successfully", data: user })
}

const getAllUsers = async (req, res) => {
    const { users, pagenation } = await UserService.getAllUsers(req.query);

    res.status(200).json({ message: "Users fetched successfully", data: users, pagenation })
}

const getUserById = async (req, res) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    if (!user) {
        throw new APIError("User not found", 404);
    }
    res.status(200).json({ message: "User fetched successfully", data: user })
}


const updateUserById = async (req, res) => {
    const { id } = req.params;
    const { name, email, age } = req.body;

    const updatedUser = await UserService.updateUserById(userId, { name, email, age });
    if (!updatedUser) {
        throw new APIError("User not found", 404);
    }
    res.status(200).json({ message: "User updated successfully", data: updatedUser })
}


const deleteUserById = async (req, res) => {
    const { id } = req.params;
    const deletedUser = await UserService.deleteUserById(id);
    if (!deletedUser) {
        throw new APIError("User not found", 404);
    }
    res.status(200).json({ message: "User deleted successfully" })
}

const uploadProfilePicture = async (req, res) => {
    if (!req.file) {
        throw new APIError('No file uploaded', 400);
    }

    const imageData = await imageKitService.uploadImage(
        req.file,
        '/profile-pictures',
        `profile-${req.user.id}`
    );

    const user = await UserService.updateProfilePicture(req.user.id, imageData);
    
    res.status(200).json({ 
        message: 'Profile picture uploaded successfully', 
        data: { profilePicture: user.profilePicture }
    });
};

const deleteProfilePicture = async (req, res) => {
    const result = await UserService.deleteProfilePicture(req.user.id);
    
    if (result?.fileId) {
        await imageKitService.deleteImage(result.fileId).catch(err => {
            console.error('Failed to delete image from ImageKit:', err.message);
        });
    }
    
    res.status(200).json({ message: 'Profile picture deleted successfully' });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const result = await UserService.forgotPassword(email);
    res.status(200).json({ message: result.message });
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    const result = await UserService.resetPassword(token, password);
    res.status(200).json({ message: result.message });
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await UserService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({ message: result.message });
};

const searchUsers = async (req, res) => {
    const result = await UserService.searchUsers(req.query);
    res.status(200).json({ 
        message: 'Search results fetched successfully', 
        data: result.users,
        pagination: result.pagination
    });
};

module.exports = { 
    signup, 
    login, 
    getAllUsers, 
    getUserById, 
    updateUserById, 
    deleteUserById,
    uploadProfilePicture,
    deleteProfilePicture,
    forgotPassword,
    resetPassword,
    changePassword,
    searchUsers
};