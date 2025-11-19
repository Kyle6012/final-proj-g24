import express from 'express';
import Post from '../models/Post.mjs';
import { isAuthenticated } from '../middleware/authMiddleware.mjs';
import { createPost, editPost, deletePost, renderEditPage } from '../controllers/postController.mjs';
import User from '../models/User.mjs';
import formidable from 'express-formidable';
import path from 'path';
import { fileURLToPath } from 'url';
import { Comment } from '../models/Comment.mjs';
import { fetchLinkPreview } from '../utils/link.mjs';
import { verifyPostContent } from '../middleware/contentSecurity.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.use(formidable({
    multiples: false,
    uploadDir: path.join(__dirname, '../uploads/post-media'),
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
}));

router.get('/create', isAuthenticated, (req, res) => res.render('createPost'));
router.post('/create', isAuthenticated, verifyPostContent,createPost);

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.findAll({
            where: { status: 'approved' },
            order: [["createdAt", "DESC"]],
            include: [
                { 
                    model: User, 
                    attributes: ['profilePic', 'username', 'fullname'] 
                },
                { 
                    model: Comment, 
                    where: { status: 'approved' },
                    required: false,
                    attributes: ['content', 'id', 'postId', 'userId', 'createdAt'],
                    include: [{ 
                        model: User, 
                        attributes: ['profilePic', 'username', 'fullname'] 
                    }]
                    // Remove order from here - it causes issues
                }
            ],
        });

        // Process posts to add link previews and sort comments
        const processedPosts = await Promise.all(posts.map(async (post) => {
            const postPlain = post.get({ plain: true });
            
            // Add link preview
            if (postPlain.content) {
                const linkPreview = await fetchLinkPreview(postPlain.content);
                postPlain.linkPreview = linkPreview;
            }
            
            // Sort comments by createdAt ASC
            if (postPlain.Comments && postPlain.Comments.length > 0) {
                postPlain.Comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            }
            
            return postPlain;
        }));

        const user = await User.findOne({ 
            where: { id: req.user.id },
            attributes: ['id', 'fullname', 'username', 'profilePic'] 
        });
        
        res.render("feed", { 
            user: user.get({ plain: true }), 
            posts: processedPosts 
        });
    } catch (e) {
        console.error('Error fetching posts:', e.message);
        res.render('error', { message: 'Error Fetching posts' });
    }
});

router.get('/edit/:id', isAuthenticated, renderEditPage);
router.post('/edit/:id', isAuthenticated, verifyPostContent, editPost);

// Handle post deletion with WebSocket notification
router.post('/delete/:id', isAuthenticated, deletePost);

export default router;
