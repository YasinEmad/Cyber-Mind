const express = require('express');
const router = express.Router();
const {
  createChallenge,
  getAllChallenges,
  getChallengeById
} = require('../controllers/challengeController');

// GET /api/challenges
router.get('/', getAllChallenges);

// GET /api/challenges/:id
router.get('/:id', getChallengeById);

// POST /api/challenges
router.post('/', createChallenge);

module.exports = router;