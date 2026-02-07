const ImageKit = require('imagekit');
const APIError = require('../utils/APIError');

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

/**
 * Upload image to ImageKit
 * @param {Buffer} file - File buffer
 * @param {string} folder - Folder path in ImageKit
 * @param {string} fileName - Name for the file
 * @returns {Promise<Object>} - ImageKit response with fileId and url
 */
const uploadImage = async (file, folder, fileName) => {
    try {
        const response = await imagekit.upload({
            file: file.buffer.toString('base64'),
            fileName: fileName || `${Date.now()}-${file.originalname}`,
            folder: folder || '/uploads',
            useUniqueFileName: true
        });

        return {
            fileId: response.fileId,
            url: response.url,
            thumbnailUrl: response.thumbnailUrl,
            name: response.name,
            filePath: response.filePath
        };
    } catch (error) {
        console.error('ImageKit upload error:', error);
        throw new APIError('Failed to upload image', 500);
    }
};

/**
 * Delete image from ImageKit
 * @param {string} fileId - ImageKit file ID
 * @returns {Promise<void>}
 */
const deleteImage = async (fileId) => {
    try {
        await imagekit.deleteFile(fileId);
    } catch (error) {
        console.error('ImageKit delete error:', error);
        throw new APIError('Failed to delete image', 500);
    }
};

/**
 * Get optimized image URL with transformations
 * @param {string} filePath - ImageKit file path
 * @param {Object} transformations - ImageKit transformations
 * @returns {string} - Transformed image URL
 */
const getImageUrl = (filePath, transformations = {}) => {
    const defaultTransformations = {
        quality: 80,
        ...transformations
    };

    return imagekit.url({
        path: filePath,
        transformation: [defaultTransformations]
    });
};

/**
 * Get thumbnail URL
 * @param {string} filePath - ImageKit file path
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} - Thumbnail URL
 */
const getThumbnailUrl = (filePath, width = 150, height = 150) => {
    return imagekit.url({
        path: filePath,
        transformation: [{
            width: width.toString(),
            height: height.toString(),
            crop: 'at_max',
            quality: 70
        }]
    });
};

/**
 * Upload multiple images
 * @param {Array} files - Array of file objects
 * @param {string} folder - Folder path in ImageKit
 * @returns {Promise<Array>} - Array of uploaded image data
 */
const uploadMultipleImages = async (files, folder) => {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    return Promise.all(uploadPromises);
};

module.exports = {
    uploadImage,
    deleteImage,
    getImageUrl,
    getThumbnailUrl,
    uploadMultipleImages
};
