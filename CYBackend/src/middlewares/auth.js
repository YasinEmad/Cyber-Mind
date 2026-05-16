const { verifyToken } = require('../utils/jwt');
const userService = require('../services/userService');

const extractToken = (req) => {
  return req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7));
};

// 1. حارس المستخدمين (المسارات الخاصة)
exports.protect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decodedToken = verifyToken(token);
    const user = await userService.getUserByIdWithProfile(decodedToken.id);

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }
    next(error);
  }
};

// 2. حارس الإدمن
exports.authAdmin = async (req, res, next) => {
  // بننادي protect الأول عشان نتأكد إنه يوزر أصلاً
  await exports.protect(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Admin resource. Access denied' });
    }
  });
};

// 3. الحارس الاختياري (للألغاز)
exports.optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = verifyToken(token);
    const user = await userService.getUserByIdWithProfile(decodedToken.id);
    req.user = user || null;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};