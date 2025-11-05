const express = require('express');
const router = express.Router();
const {
  getPuzzles,
  getPuzzleById,
  createPuzzle,
  updatePuzzle,
  deletePuzzle
} = require('../controllers/puzzleController');

// Chain GET and POST for the base route '/'
router.route('/')
  .get(getPuzzles)
  .post(createPuzzle);

// Chain GET, PUT, and DELETE for the '/:id' route
router.route('/:id')
  .get(getPuzzleById)
  .put(updatePuzzle)
  .delete(deletePuzzle);

module.exports = router;