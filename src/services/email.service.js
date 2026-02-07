const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Load and process HTML template
const loadTemplate = (templateName, variables = {}) => {
    const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace variables in template
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
    }
    
    return template;
};

// Send email helper
const sendEmail = async (to, subject, html) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@blog.com',
        to,
        subject,
        html
    };
    
    return transporter.sendMail(mailOptions);
};

// Send welcome email after registration
const sendWelcomeEmail = async (user) => {
    const html = loadTemplate('welcome', {
        name: user.name,
        email: user.email,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    });
    
    return sendEmail(user.email, 'Welcome to Our Blog!', html);
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const html = loadTemplate('passwordReset', {
        name: user.name,
        resetUrl,
        expirationTime: '15 minutes'
    });
    
    return sendEmail(user.email, 'Password Reset Request', html);
};

// Send password reset confirmation
const sendPasswordResetConfirmation = async (user) => {
    const html = loadTemplate('passwordResetConfirmation', {
        name: user.name,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    });
    
    return sendEmail(user.email, 'Password Reset Successful', html);
};

// Send comment notification to post author
const sendCommentNotification = async (postAuthor, commenter, post, comment) => {
    const postUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/posts/${post._id}`;
    
    const html = loadTemplate('commentNotification', {
        authorName: postAuthor.name,
        commenterName: commenter.name,
        postTitle: post.title,
        commentContent: comment.content.substring(0, 200) + (comment.content.length > 200 ? '...' : ''),
        postUrl
    });
    
    return sendEmail(postAuthor.email, `New Comment on "${post.title}"`, html);
};

// Send reply notification to comment author
const sendReplyNotification = async (commentAuthor, replier, comment, reply) => {
    const postUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/posts/${comment.postId}`;
    
    const html = loadTemplate('replyNotification', {
        authorName: commentAuthor.name,
        replierName: replier.name,
        originalComment: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
        replyContent: reply.content.substring(0, 200) + (reply.content.length > 200 ? '...' : ''),
        postUrl
    });
    
    return sendEmail(commentAuthor.email, 'New Reply to Your Comment', html);
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendPasswordResetConfirmation,
    sendCommentNotification,
    sendReplyNotification
};
