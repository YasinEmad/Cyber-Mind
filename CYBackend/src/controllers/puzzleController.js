const { z } = require('zod');
const { Puzzle } = require('../models');
const puzzleService = require('../services/puzzleService');
const userService = require('../services/userService');

const createPuzzleSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  level: z.number().int().refine(v => [1, 2, 3].includes(v), { message: 'Level must be 1, 2, or 3' }),
  hints: z.array(z.string()).optional().default([]),
  animation_url: z.string().optional().default(''),
  scenario: z.string().min(1, 'Scenario is required').trim(),
  answer: z.string().min(1, 'Answer is required').trim(),
  category: z.string().min(1, 'Category is required').trim(),
  active: z.boolean().optional().default(true),
}).strict();

const updatePuzzleSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().min(1).trim().optional(),
  level: z.number().int().refine(v => [1, 2, 3].includes(v), { message: 'Level must be 1, 2, or 3' }).optional(),
  hints: z.array(z.string()).optional(),
  animation_url: z.string().optional(),
  scenario: z.string().min(1).trim().optional(),
  answer: z.string().min(1).trim().optional(),
  category: z.string().min(1).trim().optional(),
  active: z.boolean().optional(),
}).strict();

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
    // ✓ SECURITY: Validate admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to create puzzles'
      });
    }

    const parsed = createPuzzleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    console.log(`[PUZZLE_ADMIN] Admin ${req.user.email} creating new puzzle`);

    const data = { ...parsed.data };
    data.tags = puzzleService.generateTags(data);

    const puzzle = await Puzzle.create(data);
    res.status(201).json(puzzle);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a puzzle
exports.updatePuzzle = async (req, res, next) => {
  try {
    // ✓ SECURITY: Validate admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to update puzzles'
      });
    }

    console.log(`[PUZZLE_ADMIN] Admin ${req.user.email} updating puzzle`);

    const { id } = req.params;
    
    if (!id || id === 'undefined' || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid puzzle ID provided' });
    }

    const puzzle = await Puzzle.findByPk(parseInt(id, 10));
    if (!puzzle) return res.status(404).json({ message: 'Puzzle not found' });

    const parsed = updatePuzzleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const data = { ...parsed.data };
    data.tags = puzzleService.generateTags({ ...puzzle.toJSON(), ...data });

    await puzzle.update(data);
    res.json(puzzle);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a puzzle
exports.deletePuzzle = async (req, res, next) => {
  try {
    // ✓ SECURITY: Validate admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to delete puzzles'
      });
    }

    console.log(`[PUZZLE_ADMIN] Admin ${req.user.email} deleting puzzle`);

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

// @desc    Delete all puzzles
exports.deleteAllPuzzles = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const deletedCount = await Puzzle.destroy({ where: {} });
    res.json({ message: `Removed ${deletedCount} puzzle(s).` });
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
      return res.json({
        correct: true,
        alreadySolved: true,
        message: 'Correct. You already solved it.',
        user: req.user ? req.user.toJSON ? req.user.toJSON() : req.user : null
      });
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

// @desc    Deduct points when a user requests a puzzle hint
exports.usePuzzleHint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hintIndex, amount } = req.body;

    if (!id || id === 'undefined' || isNaN(id)) {
      return res.status(400).json({ message: 'Invalid puzzle ID provided' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to use hints' });
    }

    const parsedHintIndex = Number(hintIndex);
    if (!Number.isInteger(parsedHintIndex) || parsedHintIndex < 0) {
      return res.status(400).json({ message: 'Invalid hint index' });
    }

    const deductionAmount = Math.max(0, Number(amount) || 0);
    if (deductionAmount <= 0) {
      return res.status(400).json({ message: 'Invalid hint deduction amount' });
    }

    const result = await userService.deductHintPoints(req.user.id, deductionAmount, id, 'puzzle', parsedHintIndex);

    return res.status(200).json({
      success: true,
      deducted: result.deducted,
      alreadyUsed: result.alreadyUsed,
      totalScore: result.totalScore,
      usedHints: result.usedHints,
    });
  } catch (err) {
    next(err);
  }
};