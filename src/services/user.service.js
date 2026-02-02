const User = require('../models/user.model');

const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const createJWT = require('../utils/createJWT');

const signup = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const createdUser = await User.create({ ...userData, password: hashedPassword });

    const token = createJWT(
        { id: createdUser._id, email: createdUser.email, role: createdUser.role },
    );

    const userWithoutPassword = createdUser.toObject();
   
    delete userWithoutPassword.password;
   
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


module.exports = { signup, login, getAllUsers, getUserById, updateUserById, deleteUserById };