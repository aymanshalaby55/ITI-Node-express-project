# Course Final Project: Building a Production-Ready Blog Server

## Objective
This document outlines the required final project for completing the Node.js course. You will extend your existing blog server with essential features that demonstrate advanced Node.js skills, API design, and integration capabilities. This project will serve as a portfolio piece showcasing your full-stack development abilities.

**Note:** This is a required project that must be completed to finish the course. All features listed below should be implemented following the MVC architecture pattern established in previous labs.

---

## Table of Contents

1. [Comments System](#1-comments-system)
2. [Likes/Reactions System](#2-likesreactions-system)
3. [Email Integration with Nodemailer](#3-email-integration-with-nodemailer)
4. [File Upload with Multer & ImageKit](#4-file-upload-with-multer--imagekit)
5. [Password Reset Flow](#5-password-reset-flow)
6. [Additional Blog Features](#6-additional-blog-features)
7. [Advanced Enhancements](#7-advanced-enhancements)

---

## 1. Comments System

### Overview
Add a comments system allowing users to comment on posts and reply to comments (nested comments).

### Requirements

#### 1.1 Comment Model
- Create `models/comments.js`
- Fields:
  - `content` (String, required, min: 1, max: 1000)
  - `postId` (ObjectId, ref: 'Post', required)
  - `userId` (ObjectId, ref: 'User', required)
  - `parentCommentId` (ObjectId, ref: 'Comment', optional) - For nested replies
  - `likes` (Number, default: 0)
  - `isEdited` (Boolean, default: false)
  - `editedAt` (Date, optional)
  - `timestamps` (enabled)

#### 1.2 Comment Service
- Create `services/comments.js`
- Functions:
  - `createComment(commentData, userId)` - Create comment or reply
  - `getAllComments(query, postId, userId)` - Get comments with pagination, filtering, and `isOwner` flag
  - `getCommentById(id, userId)` - Get single comment with `isOwner` flag
  - `updateCommentById(id, commentData, userId)` - Update comment (author only)
  - `deleteCommentById(id, userId)` - Delete comment (author or post author)
  - `getCommentsByPost(postId, userId)` - Get all comments for a specific post

#### 1.3 Comment Controller
- Create `controllers/comments.js`
- Implement controller functions that call service functions
- Handle errors appropriately

#### 1.4 Comment Routes
- Create `routers/comments.js`
- Endpoints:
  - `POST /comments` - Create comment (authenticated)
  - `GET /comments` - Get all comments (with optional `postId` filter)
  - `GET /comments/:id` - Get comment by ID
  - `PATCH /comments/:id` - Update comment (author only)
  - `DELETE /comments/:id` - Delete comment (author or post author)
  - `GET /posts/:postId/comments` - Get comments for a specific post
- Register router in `index.js`

#### 1.5 Comment Validation Schemas
- Create `schemas/comments/` folder
- Create validation schemas for:
  - Creating comments (content, postId, parentCommentId)
  - Getting comments (pagination, postId filter)
  - Updating comments (content, comment id)
- Validate nested comment depth (max 2-3 levels recommended)
- Export schemas in `schemas/comments/index.js`
- Update main `schemas/index.js` to include comments

---

## 2. Likes/Reactions System

### Overview
Add likes/reactions to posts and comments, allowing users to express their appreciation.

### Requirements

#### 2.1 Like Model
- Create `models/likes.js`
- Fields:
  - `userId` (ObjectId, ref: 'User', required)
  - `targetType` (String, enum: ['Post', 'Comment'], required)
  - `targetId` (ObjectId, required) - Reference to Post or Comment
  - `timestamps` (enabled)
- Compound index on `userId`, `targetType`, `targetId` (unique)

#### 2.2 Like Service
- Create `services/likes.js`
- Functions:
  - `toggleLike(userId, targetType, targetId)` - Toggle like (like/unlike)
  - `getLikesCount(targetType, targetId)` - Get total likes count
  - `isLikedByUser(userId, targetType, targetId)` - Check if user liked
  - `getUserLikes(userId, query)` - Get all likes by a user (with pagination)

#### 2.3 Like Controller
- Create `controllers/likes.js`
- Implement controller functions that call service functions

#### 2.4 Like Routes
- Create `routers/likes.js`
- Endpoints:
  - `POST /likes` - Toggle like on post or comment (authenticated)
  - `GET /likes/count` - Get likes count (query: `targetType`, `targetId`)
  - `GET /likes/check` - Check if user liked (query: `targetType`, `targetId`)
  - `GET /users/:userId/likes` - Get all likes by a user
- Register router in `index.js`

#### 2.5 Like Validation Schemas
- Create `schemas/likes/` folder
- Create validation schemas for like operations
- Export schemas and update main `schemas/index.js`

#### 2.6 Update Post & Comment Models
- Add virtual field or method to get likes count
- Optionally add `likedBy` array for quick access (consider performance)

---

## 3. Email Integration with Nodemailer

### Overview
Integrate email functionality for user registration, password reset, and notifications.

### Requirements

#### 3.1 Install Dependencies
```bash
npm install nodemailer
```

#### 3.2 Environment Variables
Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourblog.com
FRONTEND_URL=http://localhost:3000
```

#### 3.3 Email Service
- Create `services/email.js`
- Configure Nodemailer transporter
- Functions:
  - `sendWelcomeEmail(user)` - Send welcome email after registration
  - `sendPasswordResetEmail(user, resetToken)` - Send password reset link
  - `sendPasswordResetConfirmation(user)` - Confirm password reset
  - `sendCommentNotification(postAuthor, commenter, post, comment)` - Notify post author of new comment
  - `sendReplyNotification(commentAuthor, replier, comment, reply)` - Notify comment author of reply

#### 3.4 Email Templates
- Create `templates/emails/` folder
- Create HTML email templates:
  - `welcome.html` - Welcome email template
  - `passwordReset.html` - Password reset email template
  - `passwordResetConfirmation.html` - Password reset confirmation template
  - `commentNotification.html` - Comment notification template
  - `replyNotification.html` - Reply notification template
- Use template variables for personalization
- Include branding and professional design

#### 3.5 Integration Points
- Call `sendWelcomeEmail()` in user sign-up controller
- Call `sendPasswordResetEmail()` in password reset flow
- Call notification emails in comment creation

---

## 4. File Upload with Multer & ImageKit

### Overview
Add image upload functionality for user profile pictures and post images.

### Requirements

#### 4.1 Install Dependencies
```bash
npm install multer @imagekit/nodejs
```

#### 4.2 Environment Variables
Add to `.env`:
```env
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-imagekit-id
```

#### 4.3 Multer Configuration
- Create `middlewares/upload.js`
- Configure multer for:
  - Profile pictures (single file, max 2MB, jpg/png only)
  - Post images (multiple files, max 5MB each, jpg/png/webp)
- Add file validation (size, type)

#### 4.4 ImageKit Service
- Create `services/imageKit.js`
- Configure ImageKit client
- Functions:
  - `uploadImage(file, folder, fileName)` - Upload image to ImageKit
  - `deleteImage(fileId)` - Delete image from ImageKit
  - `getImageUrl(fileId, transformations)` - Get optimized image URL

#### 4.5 Update Models
- **User Model:** Add `profilePicture` field (String - URL)
- **Post Model:** Add `images` array field (Array of Strings - URLs)

#### 4.6 Upload Endpoints
- Add to user routes:
  - `POST /users/profile-picture` - Upload profile picture (authenticated, with multer middleware)
  - `DELETE /users/profile-picture` - Delete profile picture
- Add to post routes:
  - `POST /posts/:id/images` - Upload images to post (post author only, with multer middleware)
  - `DELETE /posts/:id/images/:imageId` - Delete post image (post author only)

#### 4.7 Image Optimization
- Use ImageKit transformations for thumbnails, resizing
- Implement lazy loading for frontend
- Add image compression before upload

---

## 5. Password Reset Flow

### Overview
Implement secure password reset functionality with email verification and token expiration.

### Requirements

#### 5.1 Update User Model
- Add fields to `models/users.js`:
  - `passwordResetToken` (String, optional)
  - `passwordResetExpires` (Date, optional)

#### 5.2 Password Reset Service
- Add functions to `services/users.js` or create `services/passwordReset.js`:
  - `generateResetToken()` - Generate secure random token using crypto.randomBytes()
  - `saveResetToken(userId, token)` - Save token with expiration (15 minutes)
  - `verifyResetToken(token)` - Verify token validity
  - `resetPassword(token, newPassword)` - Reset password and clear token

#### 5.3 Password Reset Controller
- Add functions to `controllers/users.js`:
  - `forgotPassword(req, res)` - Request password reset
  - `resetPassword(req, res)` - Reset password with token
  - `changePassword(req, res)` - Change password when logged in

#### 5.4 Password Reset Routes
- Add to `routers/users.js`:
  - `POST /users/forgot-password` - Request password reset (public)
  - `POST /users/reset-password` - Reset password with token (public)
  - `PATCH /users/change-password` - Change password when logged in (authenticated)

#### 5.5 Password Reset Validation Schemas
- Create `schemas/users/forgotPasswordSchema.js`
- Create `schemas/users/resetPasswordSchema.js`
- Create `schemas/users/changePasswordSchema.js`
- Update `schemas/users/index.js`

#### 5.6 Security Considerations
- Use crypto.randomBytes() for token generation
- Hash reset tokens before storing
- Set token expiration (15-30 minutes)
- Invalidate token after use
- Rate limit password reset requests

---

## 6. Additional Blog Features

### 6.1 Search Functionality

#### Requirements
- Implement full-text search using MongoDB text indexes
- Add text index to Post model on `title` and `content` fields
- Endpoints:
  - `GET /posts/search?q=:query` - Search posts by title/content
  - `GET /users/search?q=:query` - Search users by name/email
- Add search filters (date range, tags)
- Add validation schema for search queries

### 6.2 Post Drafts & Scheduling

#### Requirements
- Update Post model (already has `status` field with 'draft' and 'published')
- Add `publishedAt` field for scheduled posts
- Update `status` enum to include 'scheduled'
- Endpoints:
  - `GET /posts/drafts` - Get user's draft posts (authenticated)
  - `POST /posts/:id/publish` - Publish draft (post author only)
  - `POST /posts/:id/schedule` - Schedule post for future publication (post author only)
- Implement cron job or scheduled task to publish scheduled posts (optional)

### 6.3 Post Views

#### Requirements
- Add `views` field to Post model (Number, default: 0)
- Endpoint:
  - `POST /posts/:id/view` - Increment view count (public or authenticated)
- Prevent duplicate views from same user/IP (optional enhancement)

### 6.4 User Follow System

#### Requirements
- Create `models/follows.js`
- Fields: `followerId` (ref: 'User'), `followingId` (ref: 'User'), `timestamps`
- Compound unique index on `followerId` and `followingId`
- Create `services/follows.js` with CRUD operations
- Create `controllers/follows.js`
- Create `routers/follows.js`:
  - `POST /users/:userId/follow` - Follow a user (authenticated)
  - `DELETE /users/:userId/follow` - Unfollow a user (authenticated)
  - `GET /users/:userId/followers` - Get user's followers
  - `GET /users/:userId/following` - Get users being followed
- Add follower/following counts to user model (virtual fields or separate fields)

### 6.5 Bookmarks System

#### Requirements
- Create `models/bookmarks.js`
- Fields: `userId` (ref: 'User'), `postId` (ref: 'Post'), `timestamps`
- Compound unique index on `userId` and `postId`
- Create `services/bookmarks.js` with CRUD operations
- Create `controllers/bookmarks.js`
- Add routes to post router:
  - `POST /posts/:postId/bookmark` - Bookmark a post (authenticated)
  - `DELETE /posts/:postId/bookmark` - Remove bookmark (authenticated)
- Add route to user router:
  - `GET /users/bookmarks` - Get user's bookmarked posts (authenticated)

### 6.6 Notifications System

#### Requirements
- Create `models/notifications.js`
- Fields:
  - `userId` (ObjectId, ref: 'User', recipient)
  - `type` (String, enum: ['comment', 'like', 'follow', 'reply'], required)
  - `relatedUserId` (ObjectId, ref: 'User', who triggered the notification)
  - `relatedPostId` (ObjectId, ref: 'Post', optional)
  - `relatedCommentId` (ObjectId, ref: 'Comment', optional)
  - `read` (Boolean, default: false)
  - `timestamps`
- Create `services/notifications.js`:
  - `createNotification(notificationData)` - Create notification
  - `getUserNotifications(userId, query)` - Get user's notifications (paginated)
  - `markAsRead(notificationId, userId)` - Mark notification as read
  - `markAllAsRead(userId)` - Mark all notifications as read
- Create `controllers/notifications.js`
- Create `routers/notifications.js`:
  - `GET /notifications` - Get user's notifications (authenticated, paginated)
  - `PATCH /notifications/:id/read` - Mark as read (authenticated)
  - `PATCH /notifications/read-all` - Mark all as read (authenticated)
- Create notifications when:
  - Someone comments on your post
  - Someone likes your post/comment
  - Someone follows you
  - Someone replies to your comment

---

## 7. Advanced Enhancements

### 7.1 Logging & Monitoring

#### Requirements
```bash
npm install winston morgan
```

- Create `config/logger.js` or `utils/logger.js`
- Implement structured logging with Winston
- Add request logging with Morgan
- Log levels: error, warn, info, debug
- Log to files and console
- Integrate logging in error handler middleware
- (Optional) Add error tracking (consider Sentry integration)

### 7.2 API Versioning

#### Requirements
- Implement API versioning: `/api/v1/posts`, `/api/v2/posts`
- Create versioned route structure:
  - `routers/v1/posts.js`
  - `routers/v1/users.js`
  - etc.
- Support multiple versions simultaneously
- Document version differences
- Update `index.js` to register versioned routes

### 7.3 Rate Limiting Per Endpoint

#### Requirements
- Create multiple rate limiters in `middlewares/rateLimiter.js`:
  - Authentication rate limiter: 5 requests per 15 minutes
  - Password reset rate limiter: 3 requests per hour
  - General API rate limiter: 100 requests per 15 minutes
  - File upload rate limiter: 10 requests per hour
- Apply appropriate rate limiters to specific routes
- Update existing rate limiter implementation

### 7.4 Input Validation Enhancement

#### Requirements
- Use custom Joi validators
- Sanitize HTML content (for rich text posts)
- Validate file uploads (size, type, dimensions)
- Add request size limits in `index.js`
- Enhance existing validation middleware

### 7.5 Database Indexing

#### Requirements
- Add indexes to models for:
  - Frequently queried fields
  - Foreign keys (userId, postId)
  - Search fields (title, content)
  - Date fields (for sorting)
- Use compound indexes where appropriate
- Monitor query performance
- Add indexes to:
  - User model: email (already exists), name
  - Post model: user, status, createdAt, title (for search)
  - Comment model: postId, userId, parentCommentId
  - Like model: userId, targetType, targetId (already unique index)
  - Follow model: followerId, followingId
  - Bookmark model: userId, postId
  - Notification model: userId, read

### 7.6 Docker & Deployment (Optional)

#### Requirements
- Create `Dockerfile`
- Create `docker-compose.yml` (app, MongoDB, Redis if using)
- Add `.dockerignore`
- Document deployment process
- Consider CI/CD pipeline

---

## Project Structure

Your final project should follow this structure:

```
blog-server/
├── config/
│   └── logger.js (optional)
├── controllers/
│   ├── comments.js
│   ├── donations.js
│   ├── likes.js
│   ├── notifications.js
│   ├── posts.js
│   └── users.js
├── middlewares/
│   ├── authenticate.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   ├── restrictTo.js
│   ├── upload.js
│   └── validate.js
├── models/
│   ├── bookmarks.js
│   ├── comments.js
│   ├── donations.js
│   ├── follows.js
│   ├── likes.js
│   ├── notifications.js
│   ├── posts.js
│   └── users.js
├── routers/
│   ├── bookmarks.js (or integrated into posts router)
│   ├── comments.js
│   ├── donation.js
│   ├── follows.js (or integrated into users router)
│   ├── likes.js
│   ├── notifications.js
│   ├── posts.js
│   └── users.js
├── schemas/
│   ├── comments/
│   ├── donations/
│   ├── likes/
│   ├── notifications/
│   ├── posts/
│   └── users/
├── services/
│   ├── comments.js
│   ├── donations.js
│   ├── email.js
│   ├── follows.js
│   ├── imageKit.js
│   ├── likes.js
│   ├── notifications.js
│   ├── passwordReset.js (or in users.js)
│   ├── posts.js
│   └── users.js
├── templates/
│   └── emails/
│       ├── welcome.html
│       ├── passwordReset.html
│       ├── passwordResetConfirmation.html
│       ├── commentNotification.html
│       └── replyNotification.html
├── utils/
│   ├── APIError.js
│   └── logger.js (optional)
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── README.md
```

---

## Submission Checklist

Before submitting your project, ensure:

- [ ] All features from sections 1-6 are implemented
- [ ] Code follows MVC architecture pattern
- [ ] All endpoints are properly authenticated and authorized
- [ ] Error handling is comprehensive
- [ ] Input validation is implemented for all endpoints
- [ ] Security middleware is properly configured
- [ ] Database indexes are added for performance
- [ ] Email templates are professional and functional
- [ ] File uploads work correctly with ImageKit
- [ ] Password reset flow is secure and functional
- [ ] All routes are tested and working
- [ ] README.md is comprehensive with setup instructions
- [ ] Environment variables are documented in `.env.example`
- [ ] Code is clean, well-organized, and commented where necessary

---

## Resources

### Documentation
- [Nodemailer Docs](https://nodemailer.com/about/)
- [Multer Docs](https://github.com/expressjs/multer)
- [ImageKit Docs](https://docs.imagekit.io/)
- [Winston Docs](https://github.com/winstonjs/winston)
- [MongoDB Text Search](https://www.mongodb.com/docs/manual/text-search/)

### Tutorials
- Email integration tutorials
- File upload best practices
- API security best practices
- Docker deployment guides

---

## Final Notes

This project is designed to demonstrate your understanding of:
- RESTful API design
- MVC architecture
- Authentication and authorization
- Third-party API integration
- File handling
- Email services
- Database design and optimization
- Security best practices

**Remember:** Quality over quantity. It's better to have fewer features implemented well than many features implemented poorly. Focus on clean code, proper error handling, and following best practices.

Good luck with your final project! 🚀
