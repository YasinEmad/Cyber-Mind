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
const { optionalAuth } = require('../middlewares/optionalAuth');

// Chain GET and POST for the base route '/'
router.route('/')
  .get(getPuzzles)
  .post(createPuzzle);

// Chain GET, PUT, and DELETE for the '/:id' route
router.route('/:id')
  .get(getPuzzleById)
  .put(updatePuzzle)
  .delete(deletePuzzle);

// Allow optional authentication on puzzle submit so logged-in users
// will be recognized and awarded points, while guests can still try puzzles.
router.route('/:id/submit').post(optionalAuth, submitAnswer);

module.exports = router;