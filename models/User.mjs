import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';
import { Message } from "./Message.mjs";

const User = sqz.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profilePic: {
        type: DataTypes.STRING, // imagekit url for profile image
        defaultValue: '',
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isSubscribed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    bio: {
        type: DataTypes.TEXT,
        defaultValue: "",
    },
    location: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    website: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    verificationToken: {
        type: DataTypes.STRING,
    },
    verificationTokenExpires: {
        type: DataTypes.DATE,
    },
    resetToken: {
        type: DataTypes.STRING,
    },
    resetTokenExpires: {
        type: DataTypes.DATE,
    },

});


export default User;