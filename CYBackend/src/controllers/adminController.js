const User = require('../models/User');
const adminService = require('../services/adminService');
const validator = require('validator');
const { logSecurityEvent } = require('../utils/securityLogger');

// SECURITY: SUPER_ADMIN_EMAIL must be explicitly configured in the environment.
// Do NOT provide a default fallback — failing fast prevents accidental use of
// an insecure baked-in account and avoids single points of failure.
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
if (!SUPER_ADMIN_EMAIL) {
  // Fail loudly during startup to prevent running without a trusted super-admin
  throw new Error('SUPER_ADMIN_EMAIL environment variable is required');
}
const NORMALIZED_SUPER_ADMIN_EMAIL = SUPER_ADMIN_EMAIL.trim().toLowerCase();

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ success: true, data: users });
  } catch (error) { next(error); }
};

exports.grantAdmin = async (req, res, next) => {
  // RBAC-based grant admin controller
  // Security notes:
  // - Authorization is based on `req.user.role` (RBAC), not on email equality.
  // - `SUPER_ADMIN_EMAIL` is required at startup and used only to protect the
  //   specially-designated super-admin account from accidental modification.
  try {
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Enforce RBAC: only users with role 'superadmin' can grant admin
    if ((actor.role || '').toLowerCase() !== 'superadmin') {
      // Audit the failed attempt with structured data
      logSecurityEvent('FAILED_PRIVILEGE_ATTEMPT', {
        reason: 'insufficient_role',
        requiredRole: 'superadmin',
        actorId: actor.id,
        actorEmail: actor.email,
        ip: req.ip,
        target: req.body?.email || null,
      });

      return res.status(403).json({ success: false, message: 'Forbidden: superadmin required' });
    }

    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid request: email is required' });
    }

    // Normalize and validate email
    const normalized = validator.normalizeEmail(email, { gmail_remove_dots: false });
    if (!normalized || !validator.isEmail(normalized)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const targetEmail = normalized.trim().toLowerCase();

    // Prevent privilege escalation by ensuring the special super-admin account
    // cannot be altered using this endpoint.
    if (targetEmail === NORMALIZED_SUPER_ADMIN_EMAIL) {
      return res.status(400).json({ success: false, message: 'Cannot change role of the super-admin account' });
    }

    // Update role via service layer (uses Sequelize parameterized queries)
    const user = await adminService.updateUserRole(targetEmail, 'admin', NORMALIZED_SUPER_ADMIN_EMAIL);

    // Audit success
    logSecurityEvent('ADMIN_GRANTED', {
      actorId: actor.id,
      actorEmail: actor.email,
      targetEmail: user.email,
      targetId: user.id,
      ip: req.ip,
    });

    return res.status(200).json({ success: true, message: 'Admin access granted', data: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    const msg = (error && error.message) || '';
    if (msg.toLowerCase().includes('not found')) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (msg.toLowerCase().includes('already')) {
      return res.status(409).json({ success: false, message: msg });
    }

    // Unexpected error — audit and return generic message
    logSecurityEvent('ADMIN_GRANT_ERROR', {
      actorId: req.user?.id || null,
      actorEmail: req.user?.email || null,
      target: req.body?.email || null,
      error: error && error.message,
      ip: req.ip,
    });
    console.error('grantAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Unable to grant admin access' });
  }
};

exports.revokeAdmin = async (req, res, next) => {
  // RBAC-based revoke admin controller
  try {
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if ((actor.role || '').toLowerCase() !== 'superadmin') {
      logSecurityEvent('FAILED_PRIVILEGE_ATTEMPT', {
        reason: 'insufficient_role',
        requiredRole: 'superadmin',
        actorId: actor.id,
        actorEmail: actor.email,
        ip: req.ip,
        target: req.body?.email || null,
      });
      return res.status(403).json({ success: false, message: 'Forbidden: superadmin required' });
    }

    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid request: email is required' });
    }

    const normalized = validator.normalizeEmail(email, { gmail_remove_dots: false });
    if (!normalized || !validator.isEmail(normalized)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const targetEmail = normalized.trim().toLowerCase();

    // Protect super-admin account
    if (targetEmail === NORMALIZED_SUPER_ADMIN_EMAIL) {
      return res.status(400).json({ success: false, message: 'Cannot change role of the super-admin account' });
    }

    const user = await adminService.updateUserRole(targetEmail, 'user', NORMALIZED_SUPER_ADMIN_EMAIL);

    logSecurityEvent('ADMIN_REVOKED', {
      actorId: actor.id,
      actorEmail: actor.email,
      targetEmail: user.email,
      targetId: user.id,
      ip: req.ip,
    });

    return res.status(200).json({ success: true, message: 'Admin access revoked', data: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    const msg = (error && error.message) || '';
    if (msg.toLowerCase().includes('not found')) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (msg.toLowerCase().includes('already')) {
      return res.status(409).json({ success: false, message: msg });
    }

    logSecurityEvent('ADMIN_REVOKE_ERROR', {
      actorId: req.user?.id || null,
      actorEmail: req.user?.email || null,
      target: req.body?.email || null,
      error: error && error.message,
      ip: req.ip,
    });
    console.error('revokeAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Unable to revoke admin access' });
  }
};