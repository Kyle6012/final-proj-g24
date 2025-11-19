import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';
import { 
    fetchUserNotifications, 
    fetchUniversalNotifications,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    getUnreadCount,
    createNotification as createUniversalNotification
} from '../controllers/notificationController.mjs';

const router = express.Router();

// Get notifications page
router.get('/', isAuthenticated, fetchUserNotifications);

// Get universal notifications (for navbar/header)
router.get('/universal', isAuthenticated, fetchUniversalNotifications);

// Get unread notification count
router.get('/unread-count', isAuthenticated, getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', isAuthenticated, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', isAuthenticated, markAllAsRead);

// Delete a notification
router.delete('/:notificationId', isAuthenticated, deleteNotification);

// Create universal notification (admin only)
router.post('/universal', isAuthenticated, createUniversalNotification);

export default router;
