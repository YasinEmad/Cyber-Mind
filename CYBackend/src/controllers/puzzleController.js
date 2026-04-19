const { Puzzle } = require('../models');
const puzzleService = require('../services/puzzleService');

// @desc    Get all puzzles
exports.getPuzzles = async (req, res, next) => {
  try {
    const puzzles = await Puzzle.findAll();
    res.json(puzzles);
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single puzzle
exports.getPuzzleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate that ID is provided and is a valid integer
    if (!id || id === 'undefined' || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid puzzle ID provided' });
    }
    
    const puzzle = await Puzzle.findByPk(parseInt(id, 10));
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
      const existing = await Puzzle.findOne({ where: { tag: req.body.tag } });
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
    const { id } = req.params;
    
    // Validate ID
    if (!id || id === 'undefined' || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid puzzle ID provided' });
    }

    const puzzle = await Puzzle.findByPk(parseInt(id, 10));
    if (!puzzle) return res.status(404).json({ message: 'Puzzle not found' });

    // Check if tag is being updated and if it already exists (excluding current puzzle)
    if (req.body.tag && req.body.tag !== puzzle.tag) {
      const existing = await Puzzle.findOne({ where: { tag: req.body.tag } });
      if (existing) return res.status(400).json({ message: 'Tag already exists' });
    }

    // update only fields sent in req.body
    Object.keys(req.body).forEach(key => {
      puzzle[key] = req.body[key];
    });

    await puzzle.save(); // triggers validation
    res.json(puzzle);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a puzzle
exports.deletePuzzle = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || id === 'undefined' || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid puzzle ID provided' });
    }

    const deleted = await Puzzle.destroy({ where: { id: parseInt(id, 10) } });
    if (!deleted) return res.status(404).json({ message: 'Puzzle not found' });
    res.json({ message: 'Puzzle removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit an answer
exports.submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    
    // Validate ID
    if (!id || id === 'undefined' || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid puzzle ID provided' });
    }
    
    const result = await puzzleService.validateAndAwardPoints(parseInt(id, 10), answer, req.user);

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