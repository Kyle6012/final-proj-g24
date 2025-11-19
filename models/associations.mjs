// Import the models AFTER they are already defined
import User from './User.mjs';
import { Message } from './Message.mjs';
import Post from './Post.mjs';
import { Comment } from './Comment.mjs';
import { Like } from './Like.mjs';
import { Notification } from './Notifications.mjs';
import Community from './Community.mjs';
import CommunityMember from './CommunityMember.mjs';

User.hasMany(Post, { foreignKey: 'userId' }); // Assuming 'userId' is the foreign key in the Post model

Post.belongsTo(User, { foreignKey: 'userId' });
// A User has many sent messages
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });

// A User has many received messages
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

// A Message belongs to a User as a sender
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// A Message belongs to a User as a receiver
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId' });


User.hasMany(Like, { foreignKey: 'userId', onDelete: 'CASCADE' });


Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

Post.hasMany(Like, { foreignKey: 'postId', onDelete: 'CASCADE' });
Like.belongsTo(Post, { foreignKey: 'postId' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Sender associations for notifications (e.g., who liked your post)
User.hasMany(Notification, { foreignKey: 'senderId', as: 'sentNotifications' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });