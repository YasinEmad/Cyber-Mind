const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const userService = require('../services/userService');
const { getPointsForLevel } = require('../utils/points');

// Helper بسيط لإعداد الكوكيز
const setAuthCookie = (res, token) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 أيام
  };
  res.cookie('token', token, options);
};

exports.handleGoogleSignIn = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ success: false, message: 'Token not provided' });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture, email_verified, firebase } = decodedToken;
    const provider = firebase?.sign_in_provider;

    // الأمن أولاً
    if (!email) return res.status(401).json({ success: false, message: 'Email missing' });
    if (provider !== 'github.com' && !email_verified) {
      return res.status(401).json({ success: false, message: 'Email not verified' });
    }

    // استخدام الـ Service
    const user = await userService.findOrCreateGoogleUser({ uid, email, name, picture });

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      data: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    next(error);
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
};

exports.getMe = (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, photoURL } = req.body;
    const user = req.user;
    let changed = false;

    if (name?.trim() && user.name !== name.trim()) {
      user.name = name.trim();
      changed = true;
    }
    if (photoURL?.trim() && user.photoURL !== photoURL.trim()) {
      user.photoURL = photoURL.trim();
      changed = true;
    }

    if (changed) await user.save();

    const updated = await User.findById(user._id).populate('profile');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.addPoints = async (req, res, next) => {
  try {
    const { points, level, itemId, itemType } = req.body; // itemId و itemType بقوا مهمين جداً
    
    // 1. تحديد عدد النقاط
    const awardedAmount = (level !== undefined && level !== null) 
      ? getPointsForLevel(level) 
      : (Number(points) || 10);

    // 2. تحديث النقاط عن طريق الـ Service الجديد
    // itemId: الـ ID بتاع اللغز أو التحدي
    // itemType: 'puzzle' أو 'challenge'
    const result = await userService.addPointsToUser(
      req.user._id, 
      awardedAmount, 
      itemId, 
      itemType || 'puzzle'
    );

    if (!result.awarded) {
      return res.status(400).json({
        success: false,
        message: 'You have already earned points for this item.'
      });
    }

    // 3. جلب بيانات اليوزر كاملة بعد التحديث
    const updatedUser = await User.findById(req.user._id).populate('profile');

    res.status(200).json({
      success: true,
      data: updatedUser,
      awardedPointsAmount: awardedAmount
    });
  } catch (error) {
    console.error('Add Points Error:', error);
    next(error);
  }
};