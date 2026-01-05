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
    user = await User.create({ uid, email, name, photoURL: picture });
    await user.populate('profile');
  }
  return user;
};

/**
 * وظيفة موحدة لزيادة نقاط المستخدم وتحديث بروفايله
 */
exports.addPointsToUser = async (userId, amount) => {
  return await Profile.findOneAndUpdate(
    { user: userId },
    { $inc: { totalScore: amount, puzzlesDone: 1 } },
    { new: true, upsert: true }
  );
};