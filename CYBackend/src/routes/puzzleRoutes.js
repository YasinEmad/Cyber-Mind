const express = require('express');
const router = express.Router();
const {
  getPuzzles,
  getPuzzleById,
  createPuzzle,
  updatePuzzle,
  deletePuzzle,
  deleteAllPuzzles,
  submitAnswer,
  usePuzzleHint,
} = require('../controllers/puzzleController');

// التعديل هنا: بنستدعي optionalAuth من ملف auth الجديد
const { optionalAuth, authAdmin } = require('../middlewares/auth');
const { submissionLimiter } = require('../middlewares/rateLimiter');

// العمليات على المسار الرئيسي /api/puzzles
router.route('/')
  .get(getPuzzles)
  .post(authAdmin, createPuzzle)
  .delete(authAdmin, deleteAllPuzzles);

// العمليات على لغز محدد /api/puzzles/:id
router.route('/:id')
  .get(getPuzzleById)
  .patch(authAdmin, updatePuzzle)
  .delete(authAdmin, deletePuzzle);

// تصحيح الإجابة
// Apply submissionLimiter after optionalAuth so limiter keys by user when available
router.route('/:id/submit').post(optionalAuth, submissionLimiter, submitAnswer);
router.route('/:id/hint').post(optionalAuth, usePuzzleHint);

module.exports = router;