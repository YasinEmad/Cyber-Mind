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

// Debug endpoint - check current user's admin status
router.get('/me/admin-status', (req, res) => {
  try {
    // Check if user exists
    if (!req.user) {
      console.error('AdminStatus Error: No user in request');
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const statusData = {
      email: req.user.email || 'unknown',
      name: req.user.name || 'unknown',
      role: req.user.role || 'user',
      isAdmin: (req.user.role === 'admin'),
      userId: req.user.id,
      uid: req.user.uid,
    };

    console.log('AdminStatus Check:', statusData);

    res.status(200).json({
      success: true,
      data: statusData
    });
  } catch (error) {
    console.error('AdminStatus Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;