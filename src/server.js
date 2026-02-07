require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const postRoutes = require('./routes/post.route');
const userRoutes = require('./routes/user.route');
const donationRoutes = require('./routes/donation.route');
const commentRoutes = require('./routes/comment.route');
const likeRoutes = require('./routes/like.route');
const followRoutes = require('./routes/follow.route');
const notificationRoutes = require('./routes/notification.route');
const { generalLimiter } = require('./middleware/rateLimtter');
const cors = require('cors');
const app = express();
const errorHandler = require('./middleware/errorHandler');
const sanitize = require('mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const helmet = require('helmet');
const logger = require('./utils/logger');
// global middleware

// Custom mongo sanitize middleware compatible with Express 5
const mongoSanitize = (req, res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.params) req.params = sanitize(req.params);
    next();
};

app.set('trust proxy', 1);
app.use(cors()); // to allow the request from the client
app.use(express.json()); // to parse the request body
app.use(helmet());
app.use(mongoSanitize);
app.use(xss());
app.use(hpp());
app.use(generalLimiter);

// Use Morgan with Winston for HTTP logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));

// Health check endpoint for Docker
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// routes
// create post
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/donations', donationRoutes);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);
app.use('/users', followRoutes);
app.use('/notifications', notificationRoutes);
app.use(errorHandler);

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
    mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`).then(() => {
        logger.info('Connected to MongoDB successfully');
    }).catch((err) => {
        logger.error('Failed to connect to MongoDB', { error: err.message });
    });
    logger.info(`Server is running on Port:${PORT}`);
});