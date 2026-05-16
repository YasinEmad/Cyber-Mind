const { sequelize, User, Profile } = require('../models');
const { Op } = require('sequelize');

exports.findOrCreateGoogleUser = async (userData) => {
  const { uid, email, name, picture } = userData;

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
  // 1. تحديد أسماء الحقول بناءً على نوع العملية
  const isPuzzle = itemType === 'puzzle';
  const solvedField = isPuzzle ? 'solvedPuzzles' : 'solvedChallenges';
  const counterField = isPuzzle ? 'puzzlesDone' : 'challengesDone';

  // Coerce itemId to number to match stored IDs
  const itemIdNum = Number(itemId);

  // 2. جلب المستخدم والبروفايل
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) throw new Error('Profile not found');

  // 3. التحقق من عدم حل هذا التحدي من قبل (من Profile)
  if (profile[solvedField].includes(itemIdNum)) {
    return { awarded: false, alreadySolved: true };
  }

  // 4. تحديث Profile
  profile.totalScore += points;
  profile[counterField] += 1;
  profile[solvedField] = [...profile[solvedField], itemIdNum];
  await profile.save();

  // 5. تحديث User ليكون متزامناً مع Profile
  user[solvedField] = [...(user[solvedField] || []), itemIdNum];
  await user.save();

  console.log(`✓ Points awarded to user ${userId}: +${points} for ${itemType} #${itemIdNum}`);

  return { awarded: true, profile, user };
};