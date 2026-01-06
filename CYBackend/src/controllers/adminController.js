const User = require('../models/User');
const adminService = require('../services/adminService');

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'yemad7676@gmail.com';

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-solvedPuzzles -__v');
    res.status(200).json({ success: true, data: users });
  } catch (error) { next(error); }
};

exports.grantAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (req.user.email !== SUPER_ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Only super admin can do this' });
    }

    const user = await adminService.updateUserRole(email, 'admin', SUPER_ADMIN_EMAIL);
    res.status(200).json({ success: true, message: `Admin access granted to ${email}`, data: user });
  } catch (error) { next(error); }
};

exports.revokeAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (req.user.email !== SUPER_ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Only super admin can do this' });
    }

    const user = await adminService.updateUserRole(email, 'user', SUPER_ADMIN_EMAIL);
    res.status(200).json({ success: true, message: `Admin access revoked from ${email}`, data: user });
  } catch (error) { next(error); }
};