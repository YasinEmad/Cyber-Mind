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
  level: {
    type: Number,
    required: [true, 'Level is required'],
    min: 1
  },
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
  // --- New attribute added below ---
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    select: false // Hides the answer by default from queries
  },
  // ---------------------------------
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
  timestamps: true, // This automatically adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
puzzleSchema.index({ category: 1, level: 1 });
puzzleSchema.index({ active: 1 });

const Puzzle = mongoose.model('Puzzle', puzzleSchema);

module.exports = Puzzle;