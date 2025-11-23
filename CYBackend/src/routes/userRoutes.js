const express = require('express');
const router = express.Router();
const { handleFirebaseLogin, handleFirebaseRegister, logout, getMe } = require('../controllers/userController');
const { protect } = require('../middlewares/authUser');

// @route   POST /api/users/auth/firebase
// @desc    Authenticate user with Firebase ID token
// @access  Public
router.post('/auth/firebase', handleFirebaseLogin);

// @route   POST /api/users/register
// @desc    Register user with Firebase ID token and username
// @access  Public
router.post('/register', handleFirebaseRegister);

// @route   GET /api/users/logout
// @desc    Logout user and clear cookie
// @access  Public
router.get('/logout', logout);

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;
