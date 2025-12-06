const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
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
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: [true, 'Difficulty level is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  resources: [{
    type: String,
    trim: true
  }],
  hints: [{
    id: Number,
    content: String
  }],
  vulnerabilities: [{
    type: { type: String },
    severity: { type: String },
    description: { type: String },
    fix: { type: String }
  }],
  recommendations: [{
    type: String
  }],
  testCases: [{
    input: String,
    expectedOutput: String
  }],
  solution: {
    type: String,
    select: false // Hides the solution by default from queries
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
challengeSchema.index({ category: 1, difficulty: 1 });
challengeSchema.index({ active: 1 });

const Challenge = mongoose.model('Challenge', challengeSchema);
// Ensure id is exposed as 'id' in JSON
challengeSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = Challenge;
