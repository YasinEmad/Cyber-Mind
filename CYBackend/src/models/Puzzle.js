const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  // --- UPDATED LEVEL FIELD ---
  level: {
    type: Number,
    required: [true, 'Level is required'],
    enum: {
      values: [1, 2, 3],
      message: 'Level must be 1, 2, or 3'
    },
  },
  // ---------------------------
  hints: [{
    type: String,
    trim: true
  }],
  animation_url: {
    type: String,
    trim: true
  },
  scenario: {
    type: String,
    required: [true, 'Scenario is required'],
    trim: true
  },
  tag: {
    type: String,
    required: [true, 'Tag is required'],
    unique: true,
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    select: false 
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

puzzleSchema.index({ category: 1, level: 1 });
puzzleSchema.index({ active: 1 });

// Ensure `level` is always stored as a Number and is an integer (1, 2, 3 enforced by enum)
puzzleSchema.pre('validate', function(next) {
  try {
    if (this.level !== undefined && this.level !== null) {
      // coerce strings like "2" to a number
      this.level = Number(this.level);
    }
    if (!Number.isInteger(this.level)) {
      return next(new Error('Puzzle.level must be an integer'));
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

const Puzzle = mongoose.model('Puzzle', puzzleSchema);

module.exports = Puzzle;