const express = require('express');
const router = express.Router();
const {
  getPuzzles,
  getPuzzleById,
  createPuzzle,
  updatePuzzle,
  deletePuzzle,
  submitAnswer
} = require('../controllers/puzzleController');

// التعديل هنا: بنستدعي optionalAuth من ملف auth الجديد
const { optionalAuth } = require('../middlewares/auth');

// العمليات على المسار الرئيسي /api/puzzles
router.route('/')
  .get(getPuzzles)
  .post(createPuzzle); 

// العمليات على لغز محدد /api/puzzles/:id
router.route('/:id')
  .get(getPuzzleById)
  .put(updatePuzzle)
  .delete(deletePuzzle);

// تصحيح الإجابة
// optionalAuth دلوقتى بيجي من ملف auth.js المشترك
router.route('/:id/submit').post(optionalAuth, submitAnswer);

module.exports = router;