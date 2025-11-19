import express from 'express';
import { followUser, unfollowUser } from '../controllers/followController.mjs';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.post("/follow/:username", isAuthenticated, followUser);
router.post("/unfollow/:username", isAuthenticated ,unfollowUser);

export default router;