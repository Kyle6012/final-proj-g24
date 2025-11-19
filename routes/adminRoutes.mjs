import express from 'express';
import { 
    AdminLogin, 
    AdminDashboard, 
    renderModerationQueue,
    getPendingPosts,
    getPendingComments,
    approvePost,
    rejectPost,
    approveComment,
    rejectComment
} from '../controllers/adminController.mjs';
import { sendBatchEmail } from '../controllers/emailController.mjs';
import { createNotification } from '../controllers/notificationController.mjs';

const router = express.Router();

router.get('/auth/login', async (req, res) => {
    res.render('admin/login', { error_msg: req.flash('error_msg'), success_msg: req.flash('success_msg') });
});

router.post('/auth/login', AdminLogin);
router.get('/panel/dasboard', AdminDashboard);

// Moderation routes
router.get('/panel/moderation', renderModerationQueue);
router.get('/api/pending/posts', getPendingPosts);
router.get('/api/pending/comments', getPendingComments);
router.post('/api/posts/:postId/approve', approvePost);
router.post('/api/posts/:postId/reject', rejectPost);
router.post('/api/comments/:commentId/approve', approveComment);
router.post('/api/comments/:commentId/reject', rejectComment);

router.post('/panel/dashboard/send-email', sendBatchEmail);
router.post('/panel/notify', createNotification);

export default router;
