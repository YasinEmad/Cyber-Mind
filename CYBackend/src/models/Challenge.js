const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  code: {
    type: String,
    trim: true,
  },
  level: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Level is required'],
    lowercase: true,
  },
  hints: [{
    type: String,
    trim: true,
  }],
  challengeDetails: {
    type: String,
    trim: true,
  },
  recommendation: {
    type: String,
    trim: true,
  },
  feedback: {
    type: String,
    trim: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for performance
challengeSchema.index({ level: 1, points: -1 });

// Virtual id
challengeSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Challenge', challengeSchema);