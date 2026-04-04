const { sequelize } = require('../config/db');
const User = require('./User');
const Profile = require('./Profile');
const Puzzle = require('./Puzzle');
const Challenge = require('./Challenge');

// Define associations
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// For solved puzzles and challenges, since we have arrays, no direct associations needed
// But if we want to populate, we can use includes with where

module.exports = {
  sequelize,
  User,
  Profile,
  Puzzle,
  Challenge,
};