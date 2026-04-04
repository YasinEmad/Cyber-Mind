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
 */
exports.addPointsToUser = async (userId, points, itemId, itemType = 'puzzle') => {
  // 1. تحديد أسماء الحقول بناءً على نوع العملية
  const isPuzzle = itemType === 'puzzle';
  const solvedField = isPuzzle ? 'solvedPuzzles' : 'solvedChallenges';
  const counterField = isPuzzle ? 'puzzlesDone' : 'challengesDone';

  // 2. تحديث البروفايل في خطوة واحدة (Atomic Update)
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) throw new Error('Profile not found');

  // Check if already solved
  if (profile[solvedField].includes(itemId)) {
    return { awarded: false };
  }

  // Update
  profile.totalScore += points;
  profile[counterField] += 1;
  profile[solvedField] = [...profile[solvedField], itemId];
  await profile.save();

  return { awarded: true, profile };
};