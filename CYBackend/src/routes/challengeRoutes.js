const express = require('express');
const router = express.Router();
const { 
  createChallenge, 
  getAllChallenges, 
  getChallengeById, 
  submitAnswer,
  updateChallenge,
  deleteChallenge
} = require('../controllers/challengeController');
const { optionalAuth, authAdmin } = require('../middlewares/auth');

router.route('/')
  .get(getAllChallenges)
  .post(authAdmin, createChallenge); // الأدمن بس اللي يكريت

router.route('/:id')
  .get(getChallengeById)
  .put(authAdmin, updateChallenge) // الأدمن بس اللي يعدل
  .delete(authAdmin, deleteChallenge); // الأدمن بس اللي يحذف

// المسار السحري لتسليم الحل واحتساب النقط
router.post('/:id/submit', optionalAuth, submitAnswer);

module.exports = router;