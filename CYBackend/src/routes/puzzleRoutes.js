const express = require('express');
const router = express.Router();
const {
  getPuzzles,
  getPuzzleById,
  createPuzzle,
  updatePuzzle,
  deletePuzzle,
  deleteAllPuzzles,
  submitAnswer
} = require('../controllers/puzzleController');

// التعديل هنا: بنستدعي optionalAuth من ملف auth الجديد
const { optionalAuth, authAdmin } = require('../middlewares/auth');

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
// optionalAuth دلوقتى بيجي من ملف auth.js المشترك
router.route('/:id/submit').post(optionalAuth, submitAnswer);

module.exports = router;