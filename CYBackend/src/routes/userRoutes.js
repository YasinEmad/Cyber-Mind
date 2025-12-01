const express = require('express');
const router = express.Router();
const { handleGoogleSignIn, logout, getMe, updateMe, addPoints } = require('../controllers/userController');
const { protect } = require('../middlewares/authUser');

// @route   POST /api/users/auth/google
// @desc    Authenticate user with Google ID token
// @access  Public
router.post('/auth/google', handleGoogleSignIn);

// @route   GET /api/users/logout
// @desc    Logout user and clear cookie
// @access  Public
router.get('/logout', logout);

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);
// Update profile
router.patch('/me', protect, updateMe);

// Award points to current user (protected)
router.post('/me/add-points', protect, addPoints);

module.exports = router;
