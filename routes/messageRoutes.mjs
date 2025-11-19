import express from 'express';
import { getUserMessages, getChat } from '../controllers/messageController.mjs';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.get('/message', isAuthenticated, getUserMessages);
router.get('/chat/:userId', isAuthenticated, getChat);

export default router;

