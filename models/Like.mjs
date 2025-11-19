import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';

export const Like = sqz.define('Like', {
    postId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model : "Posts",
            key: "id",
        }
    },
    userLikeId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});
