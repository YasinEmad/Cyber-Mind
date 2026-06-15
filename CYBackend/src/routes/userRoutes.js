const express = require('express');
const router = express.Router();
const { 
  handleGoogleSignIn, 
  logout, 
  getMe, 
  updateMe, 
  addPoints,
  uploadAvatar
} = require('../controllers/userController');

// التعديل هنا: غيرنا authUser لـ auth
const { protect } = require('../middlewares/auth'); 
const { authLimiter } = require('../middlewares/rateLimiter');

// مسارات عامة
router.post('/auth/google', authLimiter, handleGoogleSignIn);
router.post('/logout', protect, logout);

// مسارات محمية (كل اللي جاي تحت محتاج protect)
router.use(protect); 

router.route('/me')
  .get(getMe)
  .patch(updateMe);

router.post('/me/avatar', uploadAvatar);

router.post('/me/add-points', addPoints);

module.exports = router;