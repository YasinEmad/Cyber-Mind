const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CommandTemplate = sequelize.define('CommandTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  templateId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  baseCommand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  commands: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  defaultOutput: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fields: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'command_templates',
  timestamps: true,
});

module.exports = CommandTemplate;
