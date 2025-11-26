import { Comment } from '../models/Comment.mjs';
import pusher from '../config/pusher.mjs';


export const addComment = async (req, res) => {
    const content = req.body.content;
    const { postId } = req.params;

    try {
        const newComment = await Comment.create({
            content,
            userId: req.user.id,
            postId,
        });

        if (pusher) {
            const commenter = await (await import('../models/User.mjs')).default.findByPk(req.user.id, {
                attributes: ['id', 'username', 'profilePic']
            });

            pusher.trigger(`post-${postId}`, 'new-comment', {
                ...newComment.toJSON(),
                User: commenter
            });
        }

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
        // Trigger Pusher event for real-time update
        if (pusher) {
            pusher.trigger(`post-${postId}`, 'comment-deleted', { commentId, postId });
        }

        // Send response based on request type
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({ message: "Comment deleted" });
        } else {
            res.redirect('/feed');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Error deleting Comment.' });
    }
};