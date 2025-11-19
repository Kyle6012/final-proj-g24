import User from './User.mjs';
import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';

// First define the Message model, then import User model later
export const Message = sqz.define('Message', {
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users', // Use table name instead of model reference directly
            key: 'id',
        },
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users', // Use table name instead of model reference directly
            key: 'id',
        },
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
});
