import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';
import User from './User.mjs';

export const Follow = sqz.define('Follow', {
    followerId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    followingId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
});

User.belongsToMany(User, { through: Follow, as: "Followers", foreignKey: "followingId" });
User.belongsToMany(User, { through: Follow, as: "Following", foreignKey: "followerId" });