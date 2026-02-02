const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const postRoutes = require('./routes/post.route');
const userRoutes = require('./routes/user.route');
const donationRoutes = require('./routes/donation.route');
const limiter = require('./middleware/rateLimtter');
const cors = require('cors');
const app = express();
const errorHandler = require('./middleware/errorHandler');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const helmet = require('helmet');
// global middleware
require('dotenv').config();


app.set('trust proxy', 1);
app.use(cors()); // to allow the request from the client
app.use(express.json()); // to parse the request body
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(limiter);
app.use(morgan('dev')); // HTTP request logger

// routes
// create post
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/donations', donationRoutes);
app.use(errorHandler);

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
    mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`).then(() => {
        console.log('✅✅ Connected to MongoDB');
    }).catch((err) => {
        console.log('❌❌ Connected to MongoDB');
        console.log(err);
    });
    console.log(`✅✅ Server is running on Port:${PORT}`);
});