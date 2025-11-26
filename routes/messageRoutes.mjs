import express from 'express';
import { getUserMessages, getChat, sendMessage, markMessagesAsRead } from '../controllers/messageController.mjs';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.get('/message', isAuthenticated, getUserMessages);
router.get('/chat/:userId', isAuthenticated, getChat);
router.post('/send-message', isAuthenticated, sendMessage);
router.post('/mark-read', isAuthenticated, markMessagesAsRead);

export default router;

