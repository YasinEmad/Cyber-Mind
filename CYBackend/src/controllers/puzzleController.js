const Puzzle = require('../models/Puzzle');
const puzzleService = require('../services/puzzleService');

// @desc    Get all puzzles
exports.getPuzzles = async (req, res, next) => {
  try {
    const puzzles = await Puzzle.find();
    res.json(puzzles);
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single puzzle
exports.getPuzzleById = async (req, res, next) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (!puzzle) return res.status(404).json({ message: 'Puzzle not found' });
    res.json(puzzle);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new puzzle
exports.createPuzzle = async (req, res, next) => {
  try {
    if (req.body.tag) {
      const existing = await Puzzle.findOne({ tag: req.body.tag });
      if (existing) return res.status(400).json({ message: 'Tag already exists' });
    }

    if (req.body.level) req.body.level = Number(req.body.level);

    const puzzle = await Puzzle.create(req.body);
    res.status(201).json(puzzle);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a puzzle
exports.updatePuzzle = async (req, res, next) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    if (!puzzle) return res.status(404).json({ message: 'Puzzle not found' });

    // update only fields sent in req.body
    Object.keys(req.body).forEach(key => {
      puzzle[key] = req.body[key];
    });

    await puzzle.save(); // triggers validation only on modified fields
    res.json(puzzle);
  } catch (err) {
    next(err);
  }
};






// @desc    Delete a puzzle
exports.deletePuzzle = async (req, res, next) => {
  try {
    const puzzle = await Puzzle.findByIdAndDelete(req.params.id);
    if (!puzzle) return res.status(404).json({ message: 'Puzzle not found' });
    res.json({ message: 'Puzzle removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit an answer
exports.submitAnswer = async (req, res, next) => {
  try {
    const { answer } = req.body;
    const result = await puzzleService.validateAndAwardPoints(req.params.id, answer, req.user);

    if (!result.correct) {
      return res.json({ correct: false, message: 'Incorrect answer, please try again.' });
    }

    if (result.guest) {
      return res.json({ correct: true, message: 'Correct answer! (Guest — no points awarded)' });
    }

    if (result.alreadySolved) {
      return res.json({ correct: true, alreadySolved: true, message: 'Already solved. No points awarded.' });
    }

    res.json({
      correct: true,
      awardedPointsAmount: result.awardedPointsAmount,
      message: 'Correct answer! Points awarded.',
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};