const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Puzzle = sequelize.define('Puzzle', {
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
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2, 3]],
    },
  },
  hints: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  animation_url: {
    type: DataTypes.STRING,
  },
  scenario: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  answer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  tableName: 'puzzles',
  timestamps: true,
  indexes: [
    { fields: ['category', 'level'] },
    { fields: ['active'] },
  ],
});

// Validation hook
Puzzle.beforeValidate((puzzle) => {
  if (puzzle.level !== undefined && puzzle.level !== null) {
    puzzle.level = Number(puzzle.level);
    if (!Number.isInteger(puzzle.level) || ![1, 2, 3].includes(puzzle.level)) {
      throw new Error('Puzzle.level must be 1, 2, or 3');
    }
  }
});

module.exports = Puzzle;