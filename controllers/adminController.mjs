import { Admin } from '../models/Admin.mjs';
import User from '../models/User.mjs';
import { Notification } from '../models/Notifications.mjs';
import Post from '../models/Post.mjs';
import { Comment } from '../models/Comment.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import  dotenv from 'dotenv';

dotenv.config();

export const AdminLogin = async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });

    if (admin && (await bcrypt.compare(password, admin.password))) {
        const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "5h" });
        res.cookie("adminToken", token,{ httpOnly: true });
        return res.redirect('/admin/panel/dashboard');
    } else {
        res.json({ message: "Invalid credentials" });
    }
};

export const AdminDashboard = async (req, res) => {
    const users = await User.findAll();
    const token = req.cookies.adminToken;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findOne({ where: { role: 'admin', id: decoded.id } });
    const notifications = await Notification.findAll();

    res.render('admin/dashboard', { admin, users, notifications });
};

// Get pending posts for review
export const getPendingPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: { status: 'pending' },
            order: [['createdAt', 'ASC']],
            include: [
                { model: User, attributes: ['id', 'username', 'fullname', 'profilePic', 'email'] }
            ]
        });
        res.json({ success: true, posts });
    } catch (error) {
        console.error('Error fetching pending posts:', error);
        res.status(500).json({ success: false, message: 'Error fetching pending posts' });
    }
};

// Get pending comments for review
export const getPendingComments = async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { status: 'pending' },
            order: [['createdAt', 'ASC']],
            include: [
                { model: User, attributes: ['id', 'username', 'fullname', 'profilePic'] },
                { model: Post, attributes: ['id', 'title'] }
            ]
        });
        res.json({ success: true, comments });
    } catch (error) {
        console.error('Error fetching pending comments:', error);
        res.status(500).json({ success: false, message: 'Error fetching pending comments' });
    }
};

// Approve a post
export const approvePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findByPk(postId);
        
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        post.status = 'approved';
        await post.save();

        res.json({ success: true, message: 'Post approved successfully' });
    } catch (error) {
        console.error('Error approving post:', error);
        res.status(500).json({ success: false, message: 'Error approving post' });
    }
};

// Reject a post
export const rejectPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findByPk(postId);
        
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        post.status = 'rejected';
        await post.save();

        res.json({ success: true, message: 'Post rejected successfully' });
    } catch (error) {
        console.error('Error rejecting post:', error);
        res.status(500).json({ success: false, message: 'Error rejecting post' });
    }
};

// Approve a comment
export const approveComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findByPk(commentId);
        
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        comment.status = 'approved';
        await comment.save();

        res.json({ success: true, message: 'Comment approved successfully' });
    } catch (error) {
        console.error('Error approving comment:', error);
        res.status(500).json({ success: false, message: 'Error approving comment' });
    }
};

// Reject a comment
export const rejectComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findByPk(commentId);
        
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        comment.status = 'rejected';
        await comment.save();

        res.json({ success: true, message: 'Comment rejected successfully' });
    } catch (error) {
        console.error('Error rejecting comment:', error);
        res.status(500).json({ success: false, message: 'Error rejecting comment' });
    }
};

// Render moderation review page
export const renderModerationQueue = async (req, res) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.redirect('/admin/auth/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findOne({ where: { role: 'admin', id: decoded.id } });

        if (!admin) {
            return res.redirect('/admin/auth/login');
        }

        const pendingPosts = await Post.findAll({
            where: { status: 'pending' },
            order: [['createdAt', 'ASC']],
            include: [
                { model: User, attributes: ['id', 'username', 'fullname', 'profilePic', 'email'] }
            ],
            limit: 50
        });

        const pendingComments = await Comment.findAll({
            where: { status: 'pending' },
            order: [['createdAt', 'ASC']],
            include: [
                { model: User, attributes: ['id', 'username', 'fullname', 'profilePic'] },
                { model: Post, attributes: ['id', 'title'] }
            ],
            limit: 50
        });

        res.render('admin/moderation', { 
            admin, 
            pendingPosts, 
            pendingComments,
            postsCount: pendingPosts.length,
            commentsCount: pendingComments.length
        });
    } catch (error) {
        console.error('Error rendering moderation queue:', error);
        res.status(500).render('error', { message: 'Error loading moderation queue' });
    }
};