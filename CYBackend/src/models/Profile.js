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
  // الألغاز اللي اتحلت (عشان نمنع التكرار)
  solvedPuzzles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle'
  }],
  // التحديات اللي اتحلت (عشان نمنع التكرار)
  solvedChallenges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  }],
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
}, { timestamps: true }); // ضيف دي عشان تعرف البروفايل اتعمل امتى

module.exports = mongoose.model('Profile', ProfileSchema);