import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';
import User from './User.mjs';

const Community = sqz.define('Community', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
      is: /^[a-zA-Z0-9_-]+$/i // Alphanumeric with underscore and dash
    }
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
      onDelete: "CASCADE",
    },
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

// Relationship with creator
Community.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });

export default Community;
