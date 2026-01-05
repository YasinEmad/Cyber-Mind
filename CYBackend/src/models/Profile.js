const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  puzzlesDone: {
    type: Number,
    default: 0,
  },
  challengesDone: {
    type: Number,
    default: 0,
  },
  flags: {
    type: Number,
    default: 0,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  globalRank: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Profile', ProfileSchema);