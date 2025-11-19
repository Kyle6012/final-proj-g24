import express from 'express';
import { 
    createCommunity, 
    getAllCommunities, 
    getCommunity, 
    joinCommunity, 
    leaveCommunity, 
    updateCommunity, 
    deleteCommunity,
    getCommunityMembers,
    updateMemberRole
} from '../controllers/communityController.mjs';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllCommunities);
router.get('/:name', getCommunity);
router.get('/:communityId/members', getCommunityMembers);

// Protected routes (authentication required)
router.post('/create', isAuthenticated, createCommunity);
router.post('/:communityId/join', isAuthenticated, joinCommunity);
router.post('/:communityId/leave', isAuthenticated, leaveCommunity);
router.put('/:communityId', isAuthenticated, updateCommunity);
router.delete('/:communityId', isAuthenticated, deleteCommunity);
router.put('/:communityId/members/:memberId', isAuthenticated, updateMemberRole);

export default router;
