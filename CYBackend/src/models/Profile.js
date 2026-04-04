const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  solvedPuzzles: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
  },
  solvedChallenges: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
  },
  puzzlesDone: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  challengesDone: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  flags: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  globalRank: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'profiles',
  timestamps: true,
});

// Relationships
// Profile.belongsTo(User, { foreignKey: 'userId' });

module.exports = Profile;