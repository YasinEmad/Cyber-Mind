const express = require('express');
const router = express.Router();
const { 
  createChallenge, 
  getAllChallenges, 
  getChallengeById, 
  submitAnswer 
} = require('../controllers/challengeController');
const { optionalAuth, authAdmin } = require('../middlewares/auth');

router.route('/')
  .get(getAllChallenges)
  .post(authAdmin, createChallenge); // الأدمن بس اللي يكريت

router.get('/:id', getChallengeById);

// المسار السحري لتسليم الحل واحتساب النقط
router.post('/:id/submit', optionalAuth, submitAnswer);

module.exports = router;