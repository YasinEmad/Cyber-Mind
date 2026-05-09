const admin = require('../config/firebaseAdmin');
const { User, Profile } = require('../models');
const userService = require('../services/userService');
const { getPointsForLevel } = require('../utils/points');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper بسيط لإعداد الكوكيز
const setAuthCookie = (res, token) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 أيام
  };
  res.cookie('token', token, options);
};

// Multer configuration for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

exports.uploadAvatar = [
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const userId = req.user.id;
      const profile = await Profile.findOne({ where: { userId } });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      // Delete old avatar if exists
      if (profile.avatar) {
        const oldPath = path.join('uploads', profile.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Update profile with new avatar filename
      profile.avatar = req.file.filename;
      await profile.save();

      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: { avatar: req.file.filename }
      });
    } catch (error) {
      next(error);
    }
  }
];

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
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        role: user.role,
        solvedPuzzles: user.solvedPuzzles,
        solvedChallenges: user.solvedChallenges,
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

// controllers/userController.js

exports.getMe = async (req, res, next) => {
  try {
    // بدلاً من الاعتماد على req.user فقط، سنقوم بجلب اليوزر مع البروفايل من القاعدة
    const user = await User.findByPk(req.user.id, {
      include: [
        { 
          model: Profile, 
          as: 'profile' // تأكد أن هذا الاسم يطابق التعريف في Associations
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // تحويل البيانات لـ JSON
    let userData = user.toJSON();

    // تأكد من وجود solvedCTFLevels في البروفايل
    if (userData.profile && !Array.isArray(userData.profile.solvedCTFLevels)) {
      userData.profile.solvedCTFLevels = [];
    }

    // التأكد من توافق المصفوفات (نفس المنطق الذي وضعته أنت سابقاً)
    if (!Array.isArray(userData.solvedPuzzles) && Array.isArray(userData.profile?.solvedPuzzles)) {
      userData.solvedPuzzles = userData.profile.solvedPuzzles;
    }

    res.status(200).json({ 
      success: true, 
      data: userData 
    });
  } catch (error) {
    console.error('getMe Error:', error);
    next(error);
  }
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

    const updated = await User.findByPk(user.id, { 
      include: [{ model: Profile, as: 'profile' }],
      attributes: { include: ['solvedPuzzles', 'solvedChallenges'] }
    });
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
      req.user.id, 
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
    const updatedUser = await User.findByPk(req.user.id, { include: [{ model: Profile, as: 'profile' }] });

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