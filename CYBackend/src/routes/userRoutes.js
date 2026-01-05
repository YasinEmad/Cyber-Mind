const express = require('express');
const router = express.Router();
const { 
  handleGoogleSignIn, 
  logout, 
  getMe, 
  updateMe, 
  addPoints 
} = require('../controllers/userController');

// التعديل هنا: غيرنا authUser لـ auth
const { protect } = require('../middlewares/auth'); 

// مسارات عامة
router.post('/auth/google', handleGoogleSignIn);
router.get('/logout', logout);

// مسارات محمية (كل اللي جاي تحت محتاج protect)
router.use(protect); 

router.route('/me')
  .get(getMe)
  .patch(updateMe);

router.post('/me/add-points', addPoints);

module.exports = router;