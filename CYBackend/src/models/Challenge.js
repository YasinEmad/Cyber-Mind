const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Challenge = sequelize.define('Challenge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  code: {
    type: DataTypes.TEXT,
  },
  initialCode: {
    type: DataTypes.TEXT,
  },
  vulnerabilityType: {
    type: DataTypes.ENUM('Injection', 'XSS', 'Path Traversal', 'IDOR', 'Authentication flaw', 'Authorization flaw', 'Missing validation', 'Unsafe input handling'),
  },
  level: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
  },
  hints: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  challengeDetails: {
    type: DataTypes.TEXT,
  },
  recommendation: {
    type: DataTypes.TEXT,
  },
  feedback: {
    type: DataTypes.TEXT,
  },
  solution: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  validationType: {
    type: DataTypes.ENUM('regex', 'exact'),
    allowNull: true,
    defaultValue: 'regex',
  },
  points: {
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
  tableName: 'challenges',
  timestamps: true,
  indexes: [
    { fields: ['level', 'points'] },
  ],
});

module.exports = Challenge;