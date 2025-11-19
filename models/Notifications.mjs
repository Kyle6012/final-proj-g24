import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';

export const Notification = sqz.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('post_like', 'post_comment', 'follow', 'mention', 'system', 'post_create', 'profile_update'),
        allowNull: false,
        defaultValue: 'system'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isUniversal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    sourceId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID of the related entity (post, comment, etc.)'
    },
    sourceType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Type of the related entity (post, comment, etc.)'
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'User who receives the notification'
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'User who triggered the notification (if applicable)'
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL to navigate to when notification is clicked'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});