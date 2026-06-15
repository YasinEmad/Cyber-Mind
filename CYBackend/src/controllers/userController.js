const admin = require('../config/firebaseAdmin');
const { User, Profile } = require('../models');
const userService = require('../services/userService');
const { signToken } = require('../utils/jwt');
const { getPointsForLevel } = require('../utils/points');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { fileTypeFromBuffer } = require('file-type');

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  domain: COOKIE_DOMAIN,
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 أيام
};

const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  domain: COOKIE_DOMAIN,
  path: '/',
};

// Helper بسيط لإعداد الكوكيز
const setAuthCookie = (res, token) => {
  res.cookie('token', token, cookieOptions);
};

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error('Invalid file extension'), false);
    }
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.has(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'), false);
  }
  cb(null, true);
};

const validateUploadedFile = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const buffer = fs.readFileSync(req.file.path);
    const type = await fileTypeFromBuffer(buffer);

    if (!type || !ALLOWED_TYPES.has(type.mime)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'File content does not match an allowed image type.'
      });
    }
    next();
  } catch (err) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    next(err);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

exports.uploadAvatar = [
  upload.single('avatar'),
  validateUploadedFile,
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
    const { uid, email: rawEmail, name, picture, email_verified, firebase } = decodedToken;
    const email = rawEmail?.trim().toLowerCase();
    const provider = firebase?.sign_in_provider;

    // الأمن أولاً
    if (!email) return res.status(401).json({ success: false, message: 'Email missing' });
    if (provider !== 'github.com' && !email_verified) {
      return res.status(401).json({ success: false, message: 'Email not verified' });
    }

    // استخدام الـ Service
    const user = await userService.findOrCreateGoogleUser({ uid, email, name, picture });
    const authToken = signToken({ id: user.id, uid: user.uid, role: user.role });
    setAuthCookie(res, authToken);

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

exports.logout = async (req, res) => {
  res.clearCookie('token', clearCookieOptions);
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
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