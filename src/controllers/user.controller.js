const UserService = require('../services/user.service');
const APIError = require('../utils/APIError');


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


module.exports = { signup, login, getAllUsers, getUserById, updateUserById, deleteUserById };