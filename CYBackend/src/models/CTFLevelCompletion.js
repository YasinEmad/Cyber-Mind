const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CTFLevelCompletion = sequelize.define('CTFLevelCompletion', {
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
    onDelete: 'CASCADE',
  },
  ctfLevelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ctf_levels',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  flagSubmissions: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of flag submission attempts with timestamps',
  },
  pointsAwarded: {
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
  tableName: 'ctf_level_completions',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'ctfLevelId'], unique: true },
    { fields: ['userId'] },
    { fields: ['ctfLevelId'] },
    { fields: ['isCompleted'] },
  ],
});

module.exports = CTFLevelCompletion;
