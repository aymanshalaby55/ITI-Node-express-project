const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'user'], default: 'user' },
    age: { type: Number, required: true, min: 18, max: 150 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
