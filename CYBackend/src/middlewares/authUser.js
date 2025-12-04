const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const Profile = require('../models/Profile');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decodedToken.uid }).populate('profile');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    // If a user exists but has no Profile document (edge cases, older users,
    // or partial imports), create one and attach it so downstream handlers
    // can safely assume `req.user.profile` exists.
    if (!user.profile) {
      const profile = new Profile({ user: user._id });
      await profile.save();
      user.profile = profile._id;
      await user.save();
      await user.populate('profile');
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
