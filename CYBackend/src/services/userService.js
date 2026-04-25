const { User, Profile } = require('../models');
const { Op } = require('sequelize');

exports.findOrCreateGoogleUser = async (userData) => {
  const { uid, email, name, picture } = userData;
  let user = await User.findOne({
    where: {
      [Op.or]: [{ uid }, { email }]
    },
    include: [{ model: Profile, as: 'profile' }]
  });

  if (user) {
    let changed = false;
    if (name && user.name !== name) { user.name = name; changed = true; }
    if (picture && user.photoURL !== picture) { user.photoURL = picture; changed = true; }
    if (user.uid !== uid) { user.uid = uid; changed = true; }
    if (changed) await user.save();
  } else {
    // Create user
    user = await User.create({ uid, email, name, photoURL: picture });
    // Create profile
    await Profile.create({ userId: user.id });
    // Reload with profile
    user = await User.findByPk(user.id, { include: [{ model: Profile, as: 'profile' }] });
  }
  return user;
};

/**
 * وظيفة احترافية لزيادة النقاط وتحديث عداد الإنجازات
 * يتم التحقق من أن المستخدم لم يحل هذا التحدي من قبل
 * ثم يتم تحديث كلاً من User و Profile لضمان التزامن
 */
exports.addPointsToUser = async (userId, points, itemId, itemType = 'puzzle') => {
  // 1. تحديد أسماء الحقول بناءً على نوع العملية
  const isPuzzle = itemType === 'puzzle';
  const solvedField = isPuzzle ? 'solvedPuzzles' : 'solvedChallenges';
  const counterField = isPuzzle ? 'puzzlesDone' : 'challengesDone';

  // 2. جلب المستخدم والبروفايل
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) throw new Error('Profile not found');

  // 3. التحقق من عدم حل هذا التحدي من قبل (من Profile)
  if (profile[solvedField].includes(itemId)) {
    return { awarded: false, alreadySolved: true };
  }

  // 4. تحديث Profile
  profile.totalScore += points;
  profile[counterField] += 1;
  profile[solvedField] = [...profile[solvedField], itemId];
  await profile.save();

  // 5. تحديث User ليكون متزامناً مع Profile
  user[solvedField] = [...(user[solvedField] || []), itemId];
  await user.save();

  console.log(`✓ Points awarded to user ${userId}: +${points} for ${itemType} #${itemId}`);

  return { awarded: true, profile, user };
};