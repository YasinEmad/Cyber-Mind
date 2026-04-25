const admin = require('../config/firebaseAdmin');
const { User, Profile } = require('../models');

// 1. حارس المستخدمين (المسارات الخاصة)
exports.protect = async (req, res, next) => {
  let token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7));

  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({
      where: { uid: decodedToken.uid },
      include: [{ model: Profile, as: 'profile' }],
      attributes: { include: ['solvedPuzzles', 'solvedChallenges'] }
    });

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    // More specific error handling for token issues
    if (error.message.includes('kid')) {
      return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    }
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
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
  let token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7));

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({
      where: { uid: decodedToken.uid },
      include: [{ model: Profile, as: 'profile' }],
      attributes: { include: ['solvedPuzzles', 'solvedChallenges'] }
    });
    req.user = user || null;
    next();
  } catch (err) {
    // Invalid token - treat as guest but don't error
    req.user = null;
    next();
  }
};