const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  photoURL: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
  // store solved puzzle references by Puzzle _id (ObjectId) to ensure uniqueness and avoid
  // collisions if tags change or duplicates exist. Using ObjectId makes checks unambiguous.
  solvedPuzzles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle'
  }],
});

module.exports = mongoose.model('User', UserSchema);
