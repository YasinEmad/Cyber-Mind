const User = require('../models/User');
const Profile = require('../models/Profile');

exports.findOrCreateGoogleUser = async (userData) => {
  const { uid, email, name, picture } = userData;
  let user = await User.findOne({ $or: [{ uid }, { email }] }).populate('profile');

  if (user) {
    let changed = false;
    if (name && user.name !== name) { user.name = name; changed = true; }
    if (picture && user.photoURL !== picture) { user.photoURL = picture; changed = true; }
    if (user.uid !== uid) { user.uid = uid; changed = true; }
    if (changed) await user.save();
  } else {
    // تكريك المستخدم
    user = await User.create({ uid, email, name, photoURL: picture });
    // تكريك البروفايل فوراً لضمان وجوده
    await Profile.create({ user: user._id });
    await user.populate('profile');
  }
  return user;
};

/**
 * وظيفة احترافية لزيادة النقاط وتحديث عداد الإنجازات
 */
exports.addPointsToUser = async (userId, points, itemId, itemType = 'puzzle') => {
  // 1. تحديد أسماء الحقول بناءً على نوع العملية
  const isPuzzle = itemType === 'puzzle';
  const solvedField = isPuzzle ? 'solvedPuzzles' : 'solvedChallenges';
  const counterField = isPuzzle ? 'puzzlesDone' : 'challengesDone';

  // 2. تحديث البروفايل في خطوة واحدة (Atomic Update)
  const updatedProfile = await Profile.findOneAndUpdate(
    { 
      user: userId, 
      [solvedField]: { $ne: itemId } // شرط: ميكونش الـ ID موجود قبل كدة
    },
    { 
      $inc: { 
        totalScore: points,   // زيادة النقط
        [counterField]: 1     // زيادة العداد (puzzlesDone أو challengesDone)
      },
      $addToSet: { [solvedField]: itemId } // إضافة الـ ID للمصفوفة لمنع التكرار
    },
    { new: true }
  );

  if (!updatedProfile) {
    // لو الشرط (ne$) لم يتحقق، يعني اليوزر حلها قبل كدة
    return { awarded: false };
  }

  return { awarded: true, profile: updatedProfile };
};