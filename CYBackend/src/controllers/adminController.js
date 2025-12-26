const User = require('../models/User');

// Super admin email can be configured via env var, fallback to current hardcoded value
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'yemad7676@gmail.com';

/**
 * @desc    Get all users (only admins can access)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // Admin role is already checked by authAdmin middleware
    const users = await User.find().select('-solvedPuzzles');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Grant admin access to a user
 * @route   POST /api/admin/users/grant-admin
 * @access  Private (Super Admin only)
 */
exports.grantAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Only the super admin can grant admin access
    if (req.user.email !== SUPER_ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Only super admin can grant admin access' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'User is already an admin' });
    }

    user.role = 'admin';
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `Admin access granted to ${email}`,
      data: user 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke admin access from a user
 * @route   POST /api/admin/users/revoke-admin
 * @access  Private (Super Admin only)
 */
exports.revokeAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Only the super admin can revoke admin access
    if (req.user.email !== SUPER_ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Only super admin can revoke admin access' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'User is not an admin' });
    }

    // Prevent revoking super admin's own admin status
    if (user.email === SUPER_ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Cannot revoke super admin access' });
    }

    user.role = 'user';
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `Admin access revoked from ${email}`,
      data: user 
    });
  } catch (error) {
    next(error);
  }
};
