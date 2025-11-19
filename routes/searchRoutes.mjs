import express from 'express';
import { searchUsers, searchPosts } from '../controllers/searchController.mjs';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Main search page - searches users by default
router.get('/', isAuthenticated, searchUsers);

// API endpoint for post search (for AJAX requests)
router.get('/posts', isAuthenticated, searchPosts);

export default router;