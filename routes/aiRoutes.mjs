import express from 'express';
import { chatWithAI, extractSecurityEntities } from '../controllers/aiController.mjs';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';
import User from '../models/User.mjs';

const router = express.Router();

// Render entity extraction page
router.get('/entity-extraction', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'fullname', 'username', 'profilePic']
        });
        
        if (!user) {
            return res.status(404).render('error', { message: 'User not found' });
        }
        
        res.render('entity-extraction', { user: user.get({ plain: true }) });
    } catch (error) {
        console.error('Error rendering entity extraction page:', error);
        res.status(500).render('error', { message: 'Failed to load entity extraction tool' });
    }
});

// HTTP endpoint for AI chat (optional - primary use is via Socket.IO)
router.post('/chat', isAuthenticated, async (req, res) => {
    try {
        // Fetch full user object from database (needed for chatWithAI)
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const response = await chatWithAI(user, message);
        res.json({ response });
    } catch (error) {
        console.error('AI route error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

// Security entity extraction endpoint
router.post('/extract-entities', isAuthenticated, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text content is required' });
        }
        
        // Limit text length to prevent abuse
        const maxLength = 10000; // 10KB limit
        if (text.length > maxLength) {
            return res.status(400).json({ 
                error: `Text too large. Maximum ${maxLength} characters allowed.` 
            });
        }
        
        const entities = await extractSecurityEntities(text);
        res.json({ entities });
    } catch (error) {
        console.error('Entity extraction error:', error);
        res.status(500).json({ error: error.message || 'Failed to extract security entities' });
    }
});

export default router;