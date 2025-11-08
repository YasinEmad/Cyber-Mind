const Puzzle = require('../models/Puzzle');

// @desc    Get all puzzles
// @route   GET /api/puzzles
// @access  Public
exports.getPuzzles = async (req, res) => {
  try {
    const puzzles = await Puzzle.find();
    res.json(puzzles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single puzzle
// @route   GET /api/puzzles/:id
// @access  Public
exports.getPuzzleById = async (req, res) => {
  try {
    // --- SECURITY FIX: Removed .select('+answer') ---
    // We do NOT want to send the answer to the frontend here,
    // otherwise users can cheat by looking at the network tab.
    const puzzle = await Puzzle.findById(req.params.id);
    
    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }
    res.json(puzzle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new puzzle
// @route   POST /api/puzzles
// @access  Public (You might want to make this private/admin later)
exports.createPuzzle = async (req, res) => {
  try {
    const puzzle = await Puzzle.create(req.body);
    res.status(201).json(puzzle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update an existing puzzle
// @route   PUT /api/puzzles/:id
// @access  Public (You might want to make this private/admin later)
exports.updatePuzzle = async (req, res) => {
  try {
    const puzzle = await Puzzle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    res.json(puzzle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a puzzle
// @route   DELETE /api/puzzles/:id
// @access  Public (You might want to make this private/admin later)
exports.deletePuzzle = async (req, res) => {
  try {
    const puzzle = await Puzzle.findByIdAndDelete(req.params.id);

    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    res.json({ message: 'Puzzle removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Submit an answer to a puzzle
// @route   POST /api/puzzles/:id/submit
// @access  Public
exports.submitAnswer = async (req, res) => {
  try {
    // We DO need the answer here internally to check it
    const puzzle = await Puzzle.findById(req.params.id).select('+answer');

    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    const { answer } = req.body;

    // --- BUG FIX: Robust comparison (ignore case and spaces) ---
    // This ensures " Solution " matches "solution"
    if (puzzle.answer.trim().toLowerCase() === answer.trim().toLowerCase()) { 
      res.json({ correct: true, message: 'Correct answer!' });
    } else {
      res.json({ correct: false, message: 'Incorrect answer, please try again.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};