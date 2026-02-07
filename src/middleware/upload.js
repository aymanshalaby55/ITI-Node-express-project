const multer = require('multer');
const APIError = require('../utils/APIError');

// Configure memory storage (files stored in buffer for ImageKit upload)
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new APIError('Only JPG, PNG, and WebP images are allowed', 400), false);
    }
};

// Profile picture upload configuration (single file, max 2MB)
const profilePictureUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new APIError('Only JPG and PNG images are allowed for profile pictures', 400), false);
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
}).single('profilePicture');

// Post images upload configuration (multiple files, max 5MB each)
const postImagesUpload = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
}).array('images', 10); // Max 10 images per post

// Wrapper to handle multer errors
const handleUpload = (uploadMiddleware) => {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new APIError('File size exceeds the allowed limit', 400));
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return next(new APIError('Too many files uploaded', 400));
                }
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return next(new APIError('Unexpected field name for file upload', 400));
                }
                return next(new APIError(err.message, 400));
            } else if (err) {
                return next(err);
            }
            next();
        });
    };
};

module.exports = {
    uploadProfilePicture: handleUpload(profilePictureUpload),
    uploadPostImages: handleUpload(postImagesUpload)
};
