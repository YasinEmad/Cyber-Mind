const { sequelize, User, Profile } = require('../models');
const { Op } = require('sequelize');

exports.findOrCreateGoogleUser = async (userData) => {
  let { uid, email, name, picture } = userData;
  email = email?.trim().toLowerCase();

  // Use a single transaction for the whole find-or-create flow
  const transaction = await sequelize.transaction();
  try {
    console.log('DB LOG: before User.findOne (findOrCreateGoogleUser)');
    let user = await User.findOne({
      where: { [Op.or]: [{ uid }, { email }] },
      include: [{ model: Profile, as: 'profile' }],
      transaction
    });
    console.log('DB LOG: after User.findOne =>', user ? `found user ${user.id}` : 'no user');

    if (user) {
      let changed = false;
      if (name && user.name !== name) { console.log('DB LOG: updating name', user.name, '->', name); user.name = name; changed = true; }
      if (picture && user.photoURL !== picture) { console.log('DB LOG: updating photoURL', user.photoURL, '->', picture); user.photoURL = picture; changed = true; }
      if (user.uid !== uid) { console.log('DB LOG: updating uid', user.uid, '->', uid); user.uid = uid; changed = true; }
      if (changed) {
        console.log('DB LOG: before user.save (existing user)');
        await user.save({ transaction });
        console.log('DB LOG: after user.save (existing user)');
      }
    } else {
      // Create user + profile within the same transaction
      console.log('DB LOG: before User.create (new user)');
      user = await User.create({ uid, email, name, photoURL: picture }, { transaction });
      console.log('DB LOG: after User.create =>', `created user ${user.id}`);

      console.log('DB LOG: before Profile.create (new profile)');
      await Profile.create({ userId: user.id }, { transaction });
      console.log('DB LOG: after Profile.create');

      console.log('DB LOG: before User.findByPk (reload with profile)');
      user = await User.findByPk(user.id, { include: [{ model: Profile, as: 'profile' }], transaction });
      console.log('DB LOG: after User.findByPk =>', user ? `reloaded user ${user.id}` : 'not found');
    }

    await transaction.commit();
    console.log('DB LOG: transaction committed (findOrCreateGoogleUser)');
    return user;
  } catch (error) {
    console.error('DB LOG: transaction error, rolling back (findOrCreateGoogleUser):', error);
    try { await transaction.rollback(); } catch (e) { console.error('DB LOG: rollback failed', e); }
    throw error;
  }
};

exports.getUserByIdWithProfile = async (id) => {
  return await User.findByPk(id, {
    include: [{ model: Profile, as: 'profile' }],
    attributes: { include: ['solvedPuzzles', 'solvedChallenges'] }
  });
};

/**
 * وظيفة احترافية لزيادة النقاط وتحديث عداد الإنجازات
 * يتم التحقق من أن المستخدم لم يحل هذا التحدي من قبل
 * ثم يتم تحديث كلاً من User و Profile لضمان التزامن
 */
exports.addPointsToUser = async (userId, points, itemId, itemType = 'puzzle') => {
  const isPuzzle = itemType === 'puzzle';
  const solvedField = isPuzzle ? 'solvedPuzzles' : 'solvedChallenges';
  const counterField = isPuzzle ? 'puzzlesDone' : 'challengesDone';

  const itemIdNum = Number(itemId);
  console.log(`[POINTS] Adding points for User ${userId}: points=${points}, ${itemType} ID=${itemIdNum}, solvedField=${solvedField}`);

  return await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      console.error(`[POINTS ERROR] User ${userId} not found`);
      throw new Error('User not found');
    }

    const profile = await Profile.findOne({
      where: { userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!profile) {
      console.error(`[POINTS ERROR] Profile for User ${userId} not found`);
      throw new Error('Profile not found');
    }

    const solvedList = Array.isArray(profile[solvedField]) ? profile[solvedField] : [];
    console.log(`[POINTS DEBUG] Current ${solvedField}:`, solvedList);

    const currentTotalScore = Number(profile.totalScore || 0);
    const currentSolvedCount = Number(profile[counterField] || 0);

    if (solvedList.includes(itemIdNum)) {
      console.log(`[POINTS] User ${userId} already solved ${itemType} #${itemIdNum}`);
      return {
        success: true,
        awarded: false,
        alreadySolved: true,
        points: 0,
        totalScore: currentTotalScore,
        userId: Number(userId),
      };
    }

    const finalPoints = Number(points || 0);
    profile.totalScore = currentTotalScore + finalPoints;
    profile[counterField] = currentSolvedCount + 1;
    profile[solvedField] = Array.from(new Set([...solvedList, itemIdNum]));
    await profile.save({ transaction });

    const userSolvedList = Array.isArray(user[solvedField]) ? user[solvedField] : [];
    user[solvedField] = Array.from(new Set([...userSolvedList, itemIdNum]));
    await user.save({ transaction });

    console.log(`✓ Points awarded to user ${userId}: +${finalPoints} for ${itemType} #${itemIdNum}`);

    return {
      success: true,
      awarded: true,
      alreadySolved: false,
      points: finalPoints,
      totalScore: Number(profile.totalScore || 0),
      userId: Number(userId),
    };
  });
};

/**
 * Deduct hint points from a user's profile when they request a hint.
 * Prevents duplicate deduction for the same hint index on the same item.
 */
exports.deductHintPoints = async (userId, amount, itemId, itemType = 'puzzle', hintIndex) => {
  const validItemType = itemType === 'challenge' ? 'challenges' : 'puzzles';
  const itemIdNum = Number(itemId);

  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) throw new Error('Profile not found');

  if (!profile.usedHints || typeof profile.usedHints !== 'object') {
    profile.usedHints = { puzzles: {}, challenges: {} };
  }

  if (!profile.usedHints[validItemType] || typeof profile.usedHints[validItemType] !== 'object') {
    profile.usedHints[validItemType] = {};
  }

  const usedForItem = Array.isArray(profile.usedHints[validItemType][itemIdNum])
    ? profile.usedHints[validItemType][itemIdNum]
    : [];

  if (usedForItem.includes(hintIndex)) {
    return {
      deducted: false,
      alreadyUsed: true,
      totalScore: profile.totalScore,
      usedHints: profile.usedHints,
    };
  }

  usedForItem.push(hintIndex);
  profile.usedHints[validItemType][itemIdNum] = usedForItem;
  profile.totalScore = Math.max(0, (profile.totalScore || 0) - Math.max(0, Number(amount)));

  await profile.save();

  return {
    deducted: true,
    alreadyUsed: false,
    totalScore: profile.totalScore,
    usedHints: profile.usedHints,
  };
};