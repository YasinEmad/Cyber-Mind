const { logSecurityEvent } = require('../utils/securityLogger');

// Middleware factory to require a specific role on req.user.
// Logs failed attempts with structured data.
module.exports = function requireRole(role) {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        logSecurityEvent('FAILED_PRIVILEGE_ATTEMPT', {
          reason: 'unauthenticated',
          requiredRole: role,
          ip: req.ip,
          actor: null,
          target: req.body?.email || null,
        });
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      if ((user.role || '').toLowerCase() !== (role || '').toLowerCase()) {
        // Record failed attempt for auditing
        logSecurityEvent('FAILED_PRIVILEGE_ATTEMPT', {
          reason: 'insufficient_role',
          requiredRole: role,
          actorId: user.id,
          actorEmail: user.email,
          ip: req.ip,
          target: req.body?.email || null,
        });

        return res.status(403).json({ success: false, message: 'Forbidden: insufficient privileges' });
      }

      // Authorized
      next();
    } catch (err) {
      next(err);
    }
  };
};
