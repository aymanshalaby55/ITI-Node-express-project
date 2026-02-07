const express = require('express');
const usersController = require('../controllers/user.controller');
const bookmarkController = require('../controllers/bookmark.controller');
const schemas = require('../schema/user');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authentication');
const restrictTo = require('../middleware/restrictTo');
const { uploadProfilePicture } = require('../middleware/upload');
const { authLimiter, passwordResetLimiter, uploadLimiter } = require('../middleware/rateLimtter');
const router = express.Router();


// Public routes with auth rate limiter
router.post('/signup', authLimiter, validate(schemas.createUserSchema), usersController.signup);
router.post('/login', authLimiter, validate(schemas.loginSchema), usersController.login);

// Password reset routes (public) with password reset rate limiter
router.post('/forgot-password', passwordResetLimiter, validate(schemas.forgotPasswordSchema), usersController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(schemas.resetPasswordSchema), usersController.resetPassword);

// Protected routes
router.use(authenticate);

// Change password (authenticated)
router.patch('/change-password', validate(schemas.changePasswordSchema), usersController.changePassword);

// Search users
router.get('/search', validate(schemas.searchUsersSchema), usersController.searchUsers);

// Get user's bookmarks
router.get('/bookmarks', bookmarkController.getUserBookmarks);

router.get('/', restrictTo('admin'), validate(schemas.getAllUsersSchema), usersController.getAllUsers);

// Profile picture routes with upload rate limiter
router.post('/profile-picture', uploadLimiter, uploadProfilePicture, usersController.uploadProfilePicture);
router.delete('/profile-picture', usersController.deleteProfilePicture);

// get user by id
router.get('/:id', usersController.getUserById);

// update user by id
router.patch('/:id', restrictTo("admin"), validate(schemas.updateUserSchema), usersController.updateUserById);


// delete user by id
router.delete('/:id', usersController.deleteUserById);


module.exports = router;