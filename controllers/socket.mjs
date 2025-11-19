import { Message } from '../models/Message.mjs';
import User from '../models/User.mjs';
import { Comment } from '../models/Comment.mjs';
import Post from '../models/Post.mjs';
import { Like } from '../models/Like.mjs';
import { Follow } from '../models/Follow.mjs';
import { Notification } from '../models/Notifications.mjs';
import { screenText } from '../middleware/screenText.mjs';

const onlineUsers = {};

export default async function initSocket(io) {
    io.on('connection', async (socket) => {
        const userId = socket.user?.id;
        if (userId) {
            onlineUsers[userId] = socket.id;
            io.emit('updateOnlineUsers', Object.keys(onlineUsers));
        }

        // Handle follow updates
        socket.on('followUpdate', async (data) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }
            
            try {
                const { targetUserId, action } = data;
                
                if (!targetUserId) {
                    socket.emit('errorMessage', { message: 'Target user ID is required' });
                    return;
                }
                
                // Follow model is already imported at the top
                
                if (action === 'follow') {
                    // Check if already following
                    const existingFollow = await Follow.findOne({
                        where: {
                            followerId: userId,
                            followingId: targetUserId
                        }
                    });
                    
                    if (!existingFollow) {
                        // Create new follow relationship
                        await Follow.create({
                            followerId: userId,
                            followingId: targetUserId
                        });
                        
                        console.log(`User ${userId} is now following ${targetUserId}`);
                    }
                } else if (action === 'unfollow') {
                    // Remove follow relationship
                    await Follow.destroy({
                        where: {
                            followerId: userId,
                            followingId: targetUserId
                        }
                    });
                    
                    console.log(`User ${userId} unfollowed ${targetUserId}`);
                }
                
                // Emit event to all clients to update UI
                io.emit('followUpdate', {
                    followerId: userId,
                    followingId: targetUserId,
                    action: action
                });
                
                // Send success response to the client
                socket.emit('followUpdateSuccess', {
                    message: action === 'follow' ? 'Successfully followed user' : 'Successfully unfollowed user'
                });
                
                // Create notification for the target user if this is a follow action
                if (action === 'follow') {
                    const { createUserNotification } = await import('../controllers/notificationController.mjs');
                    const currentUser = await User.findByPk(userId, {
                        attributes: ['username']
                    });
                    
                    await createUserNotification({
                        userId: targetUserId,
                        title: 'New Follower',
                        message: `@${currentUser.username} started following you`,
                        type: 'follow'
                    });
                }
            } catch (error) {
                console.error('Error handling followUpdate event:', error);
                socket.emit('errorMessage', { message: 'Failed to update follow status' });
            }
        });

        // Handle new posts
        socket.on('newPost', async (postData) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }
            
            try {
                // Validate post data
                const { title, content, mediaUrl, mediaType } = postData;
                
                if (!title && !content) {
                    socket.emit('errorMessage', { message: 'Post must contain title or content' });
                    return;
                }
                
                // Check content with screenText middleware
                const check = await screenText(content || title);
                if (!check.ok) {
                    return socket.emit('errorMessage', { 
                        message: check.reason,
                        type: 'content_violation'
                    });
                }
                
                // Create the post
                const newPost = await Post.create({
                    userId,
                    title,
                    content,
                    mediaUrl,
                    mediaType,
                    status: 'approved'
                });
                
                // Fetch the complete post with user data
                const completePost = await Post.findByPk(newPost.id, {
                    include: [{ 
                        model: User, 
                        attributes: ['id', 'username', 'fullname', 'profilePic'] 
                    }]
                });
                
                // Broadcast to all clients
                io.emit('newPost', completePost);
                
                // Send success message to the poster
                socket.emit('postSuccess', {
                    message: 'Post created successfully',
                    postId: newPost.id
                });
                
                // Create notifications for followers
                const { createUserNotification } = await import('../controllers/notificationController.mjs');
                
                // TODO: Fetch followers and create notifications for them
                // This would require a Followers model and association
                
            } catch (error) {
                console.error('Error handling newPost event:', error);
                socket.emit('errorMessage', { message: 'Failed to create post' });
            }
        });

        // Handle comments
        socket.on('sendComment', async (data) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }

            const { postId, content } = data;
            if (!postId || !content) {
                socket.emit('errorMessage', { message: 'Missing required fields' });
                return;
            }

            // Enhanced content screening with detailed feedback
            try {
                const check = await screenText(content);
                if (!check.ok) {
                    return socket.emit('errorMessage', { 
                        message: check.reason,
                        type: 'content_violation'
                    });
                }
            } catch (error) {
                console.error('Content screening error:', error);
                return socket.emit('errorMessage', { 
                    message: 'Content could not be verified. Please try again.',
                    type: 'screening_error'
                });
            }
            try {
                const post = await Post.findByPk(postId);
                if (!post) {
                    socket.emit('errorMessage', { message: 'Post not found' });
                    return;
                }

                const newComment = await Comment.create({
                    content,
                    userId,
                    postId,
                    createdAt: new Date(),
                    status: 'approved' // Set status to approved
                });

                const commenter = await User.findByPk(userId, {
                    attributes: ['id', 'username', 'profilePic']
                });

                const commentData = {
                    postId,
                    comment: {
                        ...newComment.toJSON(),
                        User: commenter
                    }
                };

                // Broadcast to all clients
                io.emit('newComment', commentData);
                
                // Create notification for post owner if it's not the same user
                if (post.userId !== userId) {
                    const { createUserNotification } = await import('../controllers/notificationController.mjs');
                    const commenter = await User.findByPk(userId, {
                        attributes: ['username', 'fullname']
                    });
                    
                    const notification = await createUserNotification({
                        userId: post.userId, // Post owner
                        senderId: userId, // Commenter
                        title: 'New Comment',
                        message: `${commenter.fullname} commented on your post`,
                        type: 'post_comment',
                        sourceId: postId,
                        sourceType: 'post',
                        link: `/feed#post-${postId}`
                    });
                    
                    // Send real-time notification to post owner
                    const postOwnerSocketId = onlineUsers[post.userId];
                    if (postOwnerSocketId) {
                        io.to(postOwnerSocketId).emit('newNotification', {
                            id: notification.id,
                            title: notification.title,
                            message: notification.message,
                            type: notification.type
                        });
                    }
                }
                
                // Send success message to the commenter
                socket.emit('commentSuccess', {
                    message: 'Comment posted successfully',
                    commentId: newComment.id
                });
            } catch (err) {
                console.error('Error creating comment:', err);
                socket.emit('errorMessage', { message: 'Failed to send comment' });
            }
        });

        // Handle post likes
        socket.on('likePost', async (postId) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }

            try {
                const post = await Post.findByPk(postId);
                if (!post) {
                    socket.emit('errorMessage', { message: 'Post not found' });
                    return;
                }

                const [like, created] = await Like.findOrCreate({
                    where: { postId, userLikeId: userId },
                    defaults: { postId, userLikeId: userId, userId: userId }
                });

                if (!created) {
                    await like.destroy();
                    post.likeCount = Math.max(0, post.likeCount - 1);
                } else {
                    post.likeCount += 1;
                    
                    // Create notification for post owner if it's not the same user
                    if (post.userId !== userId) {
                        const { createUserNotification } = await import('../controllers/notificationController.mjs');
                        const liker = await User.findByPk(userId, {
                            attributes: ['username', 'fullname']
                        });
                        
                        const notification = await createUserNotification({
                            userId: post.userId, // Post owner
                            senderId: userId, // Liker
                            title: 'New Like',
                            message: `${liker.fullname} liked your post`,
                            type: 'post_like',
                            sourceId: postId,
                            sourceType: 'post',
                            link: `/feed#post-${postId}`
                        });
                        
                        // Send real-time notification to post owner
                        const postOwnerSocketId = onlineUsers[post.userId];
                        if (postOwnerSocketId) {
                            io.to(postOwnerSocketId).emit('newNotification', {
                                id: notification.id,
                                title: notification.title,
                                message: notification.message,
                                type: notification.type
                            });
                        }
                    }
                }

            await post.save();
            io.emit('newLike', { postId, likeCount: post.likeCount });
            } catch (error) {
                console.error('Error handling like:', error);
                socket.emit('errorMessage', { message: 'Failed to process like' });
            }
        });

        // Handle post deletion
        socket.on('deletePost', async (postId) => {
            try {
                // Verify user owns the post
                const post = await Post.findByPk(postId);
                if (!post || post.userId !== userId) {
                    socket.emit('errorMessage', { message: 'Unauthorized to delete this post' });
                    return;
                }
                
                // Delete the post
                await post.destroy();
                
                // Notify all clients about the deletion
                io.emit('postDeleted', postId);
            } catch (error) {
                console.error('Error handling deletePost event:', error);
                socket.emit('errorMessage', { message: 'Failed to delete post' });
            }
        });
        
        // Handle comment deletion
        socket.on('deleteComment', async (commentId) => {
            try {
                // Verify user owns the comment
                const comment = await Comment.findByPk(commentId);
                if (!comment || comment.userId !== userId) {
                    socket.emit('errorMessage', { message: 'Unauthorized to delete this comment' });
                    return;
                }
                
                const postId = comment.postId;
                
                // Delete the comment
                await comment.destroy();
                
                // Notify all clients about the deletion
                io.emit('commentDeleted', { commentId, postId });
            } catch (error) {
                console.error('Error handling deleteComment event:', error);
                socket.emit('errorMessage', { message: 'Failed to delete comment' });
            }
        });

        // Handle connection errors
        socket.on('connect_error', (error) => {
            console.error('Connection Error:', error);
        });

        // Handle sending messages
        socket.on('sendMessage', async (data) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }

            const { message, receiverId } = data;
            if (!message || !receiverId) {
                socket.emit('errorMessage', { message: 'Missing required fields' });
                return;
            }

            try {
                // Save user message
                const userMessage = await Message.create({
                    senderId: userId,
                    receiverId,
                    message,
                    timestamp: new Date(),
                    isRead: false
                });

                // Emit to sender
                socket.emit('messageSent', {
                    ...userMessage.toJSON(),
                    isOwnMessage: true
                });

                // Regular user-to-user message
                const receiverSocketId = onlineUsers[receiverId];
                if (receiverSocketId) {
                    // Send to receiver
                    io.to(receiverSocketId).emit('receiveMessage', {
                        ...userMessage.toJSON(),
                        isOwnMessage: false
                    });
                    
                    // Also send to sender (for their own chat window)
                    socket.emit('receiveMessage', {
                        ...userMessage.toJSON(),
                        isOwnMessage: true
                    });
                }
            } catch (err) {
                console.error('Error sending message:', err);
                socket.emit('errorMessage', { message: 'Failed to send message' });
            }
        });

        // Handle message read status
        socket.on('markAsRead', async (messageId) => {
            try {
                const message = await Message.findByPk(messageId);
                if (message && message.receiverId === userId) {
                    message.isRead = true;
                    await message.save();
                    
                    // Notify sender that their message was read
                    const senderSocketId = onlineUsers[message.senderId];
                    if (senderSocketId) {
                        io.to(senderSocketId).emit('messageRead', {
                            messageId: message.id
                        });
                    }
                }
            } catch (err) {
                console.error('Error marking message as read:', err);
            }
        });

        // Handle typing indicators
        socket.on('typing', ({ receiverId }) => {
            const receiverSocketId = onlineUsers[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('displayTyping', { 
                    senderId: userId 
                });
            }
        });

        socket.on('stopTyping', ({ receiverId }) => {
            const receiverSocketId = onlineUsers[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('hideTyping', { 
                    senderId: userId 
                });
            }
        });

        // Handle disconnection
        // Handle profile updates
        socket.on('updateProfile', async (profileData) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }
            
            try {
                // Get the user
                const user = await User.findByPk(userId);
                if (!user) {
                    socket.emit('errorMessage', { message: 'User not found' });
                    return;
                }
                
                // Validate profile data
                const { fullname, bio } = profileData;
                
                if (fullname) {
                    // Check content with screenText middleware
                    const check = await screenText(fullname);
                    if (!check.ok) {
                        return socket.emit('errorMessage', { 
                            message: check.reason,
                            type: 'content_violation'
                        });
                    }
                    user.fullname = fullname;
                }
                
                if (bio) {
                    // Check content with screenText middleware
                    const check = await screenText(bio);
                    if (!check.ok) {
                        return socket.emit('errorMessage', { 
                            message: check.reason,
                            type: 'content_violation'
                        });
                    }
                    user.bio = bio;
                }
                
                // Handle other profile fields as needed
                if (profileData.location) user.location = profileData.location;
                if (profileData.website) user.website = profileData.website;
                
                try {
                    // Save the updated user
                    await user.save();
                    console.log('User profile updated successfully:', {
                        username: user.username,
                        bio: user.bio,
                        location: user.location,
                        website: user.website
                    });
                    
                    // Double-check that the update was successful by querying the database again
                    const verifiedUser = await User.findByPk(userId);
                    console.log('Verified user data after update:', {
                        username: verifiedUser.username,
                        bio: verifiedUser.bio,
                        location: verifiedUser.location,
                        website: verifiedUser.website
                    });
                    
                    // Use the verified user data for the broadcast
                    // Broadcast to all clients that might be viewing this profile
                    io.emit('profileUpdated', {
                        userId: verifiedUser.id,
                        fullname: verifiedUser.fullname,
                        username: verifiedUser.username,
                        bio: verifiedUser.bio,
                        location: verifiedUser.location,
                        website: verifiedUser.website
                    });
                    
                    // Send success message to the user
                    socket.emit('profileUpdateSuccess', {
                    message: 'Profile updated successfully'
                });
                
                // Create a notification for the user
                const { createUserNotification } = await import('../controllers/notificationController.mjs');
                await createUserNotification({
                    userId: user.id,
                    title: 'Profile Updated',
                    message: 'Your profile has been successfully updated.',
                    type: 'profile_update'
                });
                } catch (saveError) {
                    console.error('Error saving user profile:', saveError);
                    socket.emit('errorMessage', { 
                        message: 'Failed to save profile changes to database', 
                        type: 'database_error' 
                    });
                }
                
            } catch (error) {
                console.error('Error handling profile update:', error);
                socket.emit('errorMessage', { message: 'Failed to update profile' });
            }
        });
        
        // Handle notification read status
        socket.on('markNotificationRead', async (notificationId) => {
            if (!userId) {
                socket.emit('errorMessage', { message: 'Authentication required' });
                return;
            }
            
            try {
                const notification = await Notification.findByPk(notificationId);
                
                if (!notification || notification.userId !== userId) {
                    socket.emit('errorMessage', { message: 'Notification not found' });
                    return;
                }
                
                notification.isRead = true;
                await notification.save();
                
                // Send success message to the user
                socket.emit('notificationMarkedRead', {
                    notificationId,
                    success: true
                });
                
            } catch (error) {
                console.error('Error marking notification as read:', error);
                socket.emit('errorMessage', { message: 'Failed to update notification' });
            }
        });
        
        socket.on('disconnect', () => {
            if (userId) {
                delete onlineUsers[userId];
                io.emit('updateOnlineUsers', Object.keys(onlineUsers));
            }
        });
    });
}
