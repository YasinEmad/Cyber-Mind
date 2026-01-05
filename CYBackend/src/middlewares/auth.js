const admin = require('../config/firebaseAdmin');
const User = require('../models/User');

// 1. حارس المستخدمين (المسارات الخاصة)
exports.protect = async (req, res, next) => {
  let token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer') && req.headers.authorization.split(' ')[1]);

  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decodedToken.uid }).populate('profile');

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
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
  let token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer') && req.headers.authorization.split(' ')[1]);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decodedToken.uid }).populate('profile');
    req.user = user || null;
    next();
  } catch (err) {
    req.user = null; // لو التوكن بايظ بنعتبره ضيف برضه
    next();
  }
};