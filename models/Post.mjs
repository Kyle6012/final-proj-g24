import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';
import Community from './Community.mjs';

const Post = sqz.define('Post', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "Users",
            key: "id",
            onDelete:"CASCADE",
        },
    },
    communityId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow null for backward compatibility with existing posts
        references: {
            model: "Communities",
            key: "id",
            onDelete: "SET NULL",
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mediaType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    likeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
    }
});

// Relationship with Community
Post.belongsTo(Community, { foreignKey: 'communityId' });
Community.hasMany(Post, { foreignKey: 'communityId' });

export default Post;