import { Message } from "../models/Message.mjs";
import User from "../models/User.mjs";
import sqz from '../config/db.mjs';
import pusher from '../config/pusher.mjs';

export const getUserMessages = async (req, res) => {
    const userId = req.user.id;

    try {
        // Query to fetch user messages and unread count
        const userMsgD = await Message.findAll({
            attributes: [
                [sqz.col('receiver.id'), 'id'],
                [sqz.col('receiver.username'), 'username'],
                [sqz.col('receiver.profilePic'), 'profilePic'],
                // Unread count using parameterized subquery
                [sqz.literal(`(
                    SELECT COUNT(*)
                    FROM "Messages" AS m 
                    WHERE m."senderId" = "receiver"."id"
                    AND m."receiverId" = :userId
                    AND m."isRead" = false
                )`), 'unreadCount']
            ],
            where: { senderId: userId },
            group: ['receiver.id', 'receiver.username', 'receiver.profilePic'],
            include: [
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username', 'profilePic'], // Ensure we're including these fields
                    required: false
                }
            ],
            order: [[sqz.col('receiver.username'), 'ASC']],
            // Pass the userId as a parameter to the query
            replacements: { userId }
        });

        const user = await User.findOne({ where: { id: userId } });

        // Check if userMsgD contains data
        if (!userMsgD || userMsgD.length === 0) {
            return res.render('message', {
                user,
                users: []
            });
        }

        // Render messages
        res.render('message', {
            user,
            users: userMsgD
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).render('error', { message: "Something went wrong." });
    }
};



// fetch messages between users
export const getChat = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.findAll({
        where: {
            senderId: [currentUserId, userId],
            receiverId: [currentUserId, userId]
        },
        order: [['timestamp', 'ASC']],
    });

    // mark messages aas read if currentUser is reciever
    await Message.update({ isRead: true }, { where: { receiverId: currentUserId, senderId: userId, isRead: false } });

    const user = await User.findOne({ where: { id: currentUserId } });

    const receiver = await User.findByPk(userId, { attributes: ['id', 'username', 'profilePic'] });

    res.render('chat', { user, messages, receiver });
};

// mark messages read mannually , its an if needed
export const markMessagesAsRead = async (req, res) => {
    const { senderId } = req.body; // the convo partner
    const receiverId = req.user.id;

    try {
        await Message.update({ isRead: true }, { where: { senderId, receiverId, isRead: false } });

        if (pusher) {
            // Notify sender that messages were read
            pusher.trigger(`user-${senderId}`, 'messages-read', {
                readerId: receiverId
            });
        }

        res.json({ message: ' message marked as read' });
    } catch (err) {
        console.error('Error marking messages as read:', err);
        res.status(500).send('Something went wrong.');
    }
};

export const sendMessage = async (req, res) => {
    const { message, receiverId } = req.body;
    const senderId = req.user.id;

    if (!message || !receiverId) {
        return res.status(400).json({ message: 'Message and receiverId are required' });
    }

    try {
        const userMessage = await Message.create({
            senderId,
            receiverId,
            message,
            timestamp: new Date(),
            isRead: false
        });

        if (pusher) {
            // Trigger event for receiver
            pusher.trigger(`user-${receiverId}`, 'new-message', {
                ...userMessage.toJSON(),
                isOwnMessage: false,
                sender: {
                    id: req.user.id,
                    username: req.user.username,
                    profilePic: req.user.profilePic
                }
            });

            // Trigger event for sender (optional, but good for multi-tab consistency)
            pusher.trigger(`user-${senderId}`, 'message-sent', {
                ...userMessage.toJSON(),
                isOwnMessage: true
            });
        }

        res.status(201).json({ message: 'Message sent', data: userMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};
