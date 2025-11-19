import { DataTypes } from "sequelize";
import sqz from '../config/db.mjs';
import User from './User.mjs';
import Community from './Community.mjs';

const CommunityMember = sqz.define('CommunityMember', {
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
      onDelete: "CASCADE",
    },
  },
  communityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Communities",
      key: "id",
      onDelete: "CASCADE",
    },
  },
  role: {
    type: DataTypes.ENUM('member', 'moderator', 'admin'),
    defaultValue: 'member',
    allowNull: false,
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

// Many-to-many relationship between users and communities
User.belongsToMany(Community, { through: CommunityMember, as: 'communities', foreignKey: 'userId' });
Community.belongsToMany(User, { through: CommunityMember, as: 'members', foreignKey: 'communityId' });

// Add direct associations for easier querying
CommunityMember.belongsTo(User, { foreignKey: 'userId' });
CommunityMember.belongsTo(Community, { foreignKey: 'communityId' });

export default CommunityMember;
