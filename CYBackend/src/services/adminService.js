const User = require('../models/User');

exports.updateUserRole = async (email, newRole, superAdminEmail) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  // حماية السوبر أدمن من إن رتبته تتغير بالغلط
  if (user.email === superAdminEmail && newRole !== 'admin') {
    throw new Error('Cannot revoke super admin access');
  }

  // لو بنحاول نخليه أدمن وهو أصلاً أدمن، أو العكس
  if (user.role === newRole) {
    throw new Error(`User is already ${newRole === 'admin' ? 'an admin' : 'a regular user'}`);
  }

  user.role = newRole;
  await user.save();
  return user;
};