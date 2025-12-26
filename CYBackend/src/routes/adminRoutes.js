const express = require('express');
const router = express.Router();
const { getAllUsers, grantAdmin, revokeAdmin } = require('../controllers/adminController');
const { authAdmin } = require('../middlewares/authAdmin');

// All admin routes require authentication and admin role

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', authAdmin, getAllUsers);

/**
 * @route   POST /api/admin/users/grant-admin
 * @desc    Grant admin access to a user
 * @access  Private (Super Admin only)
 */
router.post('/users/grant-admin', authAdmin, grantAdmin);

/**
 * @route   POST /api/admin/users/revoke-admin
 * @desc    Revoke admin access from a user
 * @access  Private (Super Admin only)
 */
router.post('/users/revoke-admin', authAdmin, revokeAdmin);

module.exports = router;
