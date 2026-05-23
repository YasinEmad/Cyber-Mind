const express = require('express');
const router = express.Router();
const { 
  createChallenge, 
  getAllChallenges, 
  getChallengeById, 
  submitAnswer,
  runCode,
  useChallengeHint,
  updateChallenge,
  deleteChallenge,
  deleteAllChallenges
} = require('../controllers/challengeController');
const { optionalAuth, authAdmin } = require('../middlewares/auth');
const { submissionLimiter, executeLimiter } = require('../middlewares/rateLimiter');

router.route('/')
  .get(getAllChallenges)
  .post(authAdmin, createChallenge) // الأدمن بس اللي يكريت
  .delete(authAdmin, deleteAllChallenges); // الأدمن بس اللي يمسح الكل

router.route('/:id')
  .get(getChallengeById)
  .put(authAdmin, updateChallenge) // الأدمن بس اللي يعدل
  .delete(authAdmin, deleteChallenge); // الأدمن بس اللي يحذف

// المسار السحري لتسليم الحل واحتساب النقط
// Apply submissionLimiter after optionalAuth so limiter keys by user when present
router.post('/:id/submit', optionalAuth, submissionLimiter, submitAnswer);
router.post('/:id/hint', optionalAuth, submissionLimiter, useChallengeHint);

// تشغيل الكود
// CRITICAL SECURITY: executeLimiter protects against code execution abuse, infinite loops, and CPU attacks
router.post('/:id/run', optionalAuth, executeLimiter, runCode);

// AI review (evaluate code without awarding points)
// CRITICAL SECURITY: executeLimiter protects against code compilation abuse
router.post('/:id/ai-review', optionalAuth, executeLimiter, require('../controllers/challengeController').aiReview);

module.exports = router;