const express = require('express');
const mongoose = require('mongoose');

const app = express();

// global middleware
app.use(express.json()); // middleware parses reqest body and adds it to req.body

// schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'user'], default: 'user' },
    age: { type: Number, required: true, min: 18, max: 150 },
}, { timestamps: true });
// model
const User = mongoose.model('User', userSchema);
//routes
// create user
app.post('/users', async (req, res) => {
    const { name, email, password, age } = req.body;

    if (!name || !email || !password || !age) {
        return res.status(400).json({ message: "All fields are required" })
    }

    const user = await User.create({ name, email, password, age });

    res.status(201).json({ message: "User created successfully", data: user })
})

// get all users
app.get('/users', async (req, res) => {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page);
    limit = Number(limit);
    const usersPromise = User.find({}, { password: 0 }).skip((page - 1) * limit).limit(limit);
    const totalPromise = User.countDocuments();
    const [users, total] = await Promise.all([usersPromise, totalPromise]);
    res.json({
        message: "Users fetched successfully", data: users, pagenation: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    })
})

// get user by id ,
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid user ID" })
    }
    const user = await User.findOne({ _id: id }, { password: 0 });
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User fetched successfully", data: user });
})

// update user by id
app.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid user ID" })
    }
    const { name, email, age } = req.body;

    const updatedUser = await User.findOneAndUpdate({ _id: id }, { name, email, age }, { new: true });

    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User updated successfully", data: updatedUser });
})

// delete user by id
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid user ID" })
    }

    const deletedUser = await User.findOneAndDelete({ _id: id });
    if (!deletedUser) {
        return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User deleted successfully" });
})




app.listen(3000, () => {
    mongoose.connect('mongodb://localhost:27017/iti-zag').then(() => {
        console.log('✅✅ Connected to MongoDB')
    }).catch((err) => {
        console.log('❌❌ Connected to MongoDB')
        console.log(err)
    });
    console.log('✅✅ Server is running on Port:3000');
});