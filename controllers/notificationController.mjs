import { Notification } from "../models/Notifications.mjs";
import User from "../models/User.mjs";
import Post from "../models/Post.mjs";
import { Comment } from "../models/Comment.mjs";

// Create a universal notification (admin only)
export const createNotification = async (req, res) => {
    const { title, message } = req.body;
    try {
        const notification = await Notification.create({ 
            title, 
            message, 
            isUniversal: true,
            type: 'system',
            userId: req.user.id // Admin who created it
        });
        
        // Emit to all connected users via socket
        if (res.io) {
            res.io.emit('universalNotification', notification);
        }
        
        res.redirect('/admin/dashboard');
    } catch (e){
        console.error(e.message);
        res.render('error', { message: 'Failed to create notification' });
    }
};

// Create a user-specific notification
export const createUserNotification = async ({
    userId, // Recipient
    senderId = null, // Sender (optional)
    title,
    message,
    type = 'system',
    sourceId = null,
    sourceType = null,
    link = null
}) => {
    try {
        const notification = await Notification.create({
            userId,
            senderId,
            title,
            message,
            type,
            sourceId,
            sourceType,
            link,
            isUniversal: false
        });
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// Fetch all notifications for the current user
export const fetchUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({ 
            where: { 
                userId: req.user.id,
                isUniversal: false
            },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'fullname', 'profilePic']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        
        res.render('notifications', { notifications, user: req.user });
    } catch (e) {
        console.error(e.message);
        res.render('error', { message: 'Failed to fetch notifications' });
    }
};

// Fetch universal notifications
export const fetchUniversalNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({ 
            where: { isUniversal: true },
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        res.json(notifications);
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    
    try {
        const notification = await Notification.findByPk(notificationId);
        
        if (!notification || notification.userId !== req.user.id) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        notification.isRead = true;
        await notification.save();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.user.id, isRead: false } }
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Failed to update notifications' });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    
    try {
        const notification = await Notification.findByPk(notificationId);
        
        if (!notification || notification.userId !== req.user.id) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        await notification.destroy();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: { 
                userId: req.user.id,
                isRead: false 
            }
        });
        
        res.json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Failed to get notification count' });
    }
};

// Legacy function for backward compatibility
export const fetchNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({ where: { isUniversal: true } });
        res.json(notifications);
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};