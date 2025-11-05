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
    // req.body will contain all fields like title, description, level, etc.
    const puzzle = await Puzzle.create(req.body);
    // Send 201 Created status
    res.status(201).json(puzzle);
  } catch (err) {
    // This will catch Mongoose validation errors
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
        new: true, // This option returns the modified document
        runValidators: true, // This ensures schema validations are run on update
      }
    );

    if (!puzzle) {
      return res.status(404).json({ message: 'Puzzle not found' });
    }

    res.json(puzzle);
  } catch (err) {
    // Catches validation errors or server errors
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
