import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';
import { addComment, deleteComment } from '../controllers/commentController.mjs';
import multer from 'multer';

const upload = multer();

const router = express.Router();
router.use(express.urlencoded({ extended: true }));

router.post('/add/:postId', isAuthenticated, upload.none(), addComment);
router.post('/delete/:commentId', isAuthenticated, deleteComment);

export default router;
