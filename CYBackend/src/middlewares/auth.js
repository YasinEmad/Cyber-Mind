const admin = require('../config/firebaseAdmin');
const axios = require('axios');
const { User, Profile } = require('../models');

// 1. حارس المستخدمين (المسارات الخاصة)
exports.protect = async (req, res, next) => {
  let token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7));

  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    let decodedToken;

    // If a remote auth base is configured, delegate token verification to that remote API
    if (process.env.REMOTE_AUTH_BASE) {
      try {
        const remoteRes = await axios.get(`${process.env.REMOTE_AUTH_BASE.replace(/\/+$/,'')}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const remoteUser = remoteRes.data;
        // Map remote response to a decodedToken-like object
        decodedToken = {
          uid: remoteUser.uid || remoteUser.id || remoteUser.userId,
          email: remoteUser.email,
          name: remoteUser.name || remoteUser.displayName,
          picture: remoteUser.picture || remoteUser.photoURL,
          firebase: { sign_in_provider: remoteUser.provider || null }
        };
      } catch (err) {
        // remote verification failed
        return res.status(401).json({ success: false, message: 'Not authorized (remote verification failed)' });
      }
    } else {
      decodedToken = await admin.auth().verifyIdToken(token);
    }

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
    if (error.message && error.message.includes('kid')) {
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
    let decodedToken;
    if (process.env.REMOTE_AUTH_BASE) {
      try {
        const remoteRes = await axios.get(`${process.env.REMOTE_AUTH_BASE.replace(/\/+$/,'')}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const remoteUser = remoteRes.data;
        decodedToken = {
          uid: remoteUser.uid || remoteUser.id || remoteUser.userId,
          email: remoteUser.email,
          name: remoteUser.name || remoteUser.displayName,
          picture: remoteUser.picture || remoteUser.photoURL,
          firebase: { sign_in_provider: remoteUser.provider || null }
        };
      } catch (e) {
        req.user = null;
        return next();
      }
    } else {
      decodedToken = await admin.auth().verifyIdToken(token);
    }

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