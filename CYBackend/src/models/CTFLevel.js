const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CTFLevel = sequelize.define('CTFLevel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  hint: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  flag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'easy',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  commands: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  customCommands: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  commandTemplates: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  requiredCommandSequence: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  successCondition: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  initialDirectory: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/home/user',
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
  tableName: 'ctf_levels',
  timestamps: true,
  indexes: [
    { fields: ['level'] },
    { fields: ['isActive'] },
    { fields: ['difficulty'] },
  ],
});

module.exports = CTFLevel;