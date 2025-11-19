import { Comment } from '../models/Comment.mjs';


export const addComment = async (req, res) => {
    const content = req.body.content;
    const { postId } = req.params;

    try {
        await Comment.create({
            content,
            userId: req.user.id,
            postId,
        });

        res.json({ message: "Comment added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding Comment.' });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.commentId);
        if (!comment || comment.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

        const postId = comment.postId;
        const commentId = comment.id;
        
        await comment.destroy();
        
        // Emit WebSocket event for real-time update
        if (res.io) {
            res.io.emit('commentDeleted', { commentId, postId });
        }
        
        // Send response based on request type
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({ message: "Comment deleted" });
        } else {
            res.redirect('/feed');
        }
    } catch (err){
        console.error(err.message);
        res.status(500).json({ message: 'Error deleting Comment.' });
    }
};