import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';

export const Admin = sqz.define('Admin', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    username: { 
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    role: {
        type: DataTypes.ENUM('admin', 'moderator', 'user'),
        defaultValue: 'admin',
        allowNull: false,
    }
});