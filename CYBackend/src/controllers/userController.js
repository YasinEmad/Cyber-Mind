const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { getPointsForLevel } = require('../utils/points');

exports.handleGoogleSignIn = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token not provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // decodedToken will include which provider was used to sign in under decodedToken.firebase.sign_in_provider
    const { uid, email, name, picture, email_verified, firebase } = decodedToken;
    const provider = firebase && firebase.sign_in_provider ? firebase.sign_in_provider : null;

    // For security we require an email. For most providers we require email verification.
    if (!email) {
      return res.status(401).json({ success: false, message: 'Email not provided by provider' });
    }

    // GitHub sometimes does not set email_verified in the token payload (depending on account settings).
    // Accept GitHub provider tokens even when email_verified is false, but for other providers keep the check.
    if (provider !== 'github.com' && !email_verified) {
      return res.status(401).json({ success: false, message: 'Email not verified' });
    }

    let user = await User.findOne({ uid }).populate('profile');

    // If user not found by uid, try to find by email (helpful if users somehow had existing email-only accounts)
    if (!user) {
      const byEmail = await User.findOne({ email });
      if (byEmail) {
        // link accounts by updating uid and other public fields
        byEmail.uid = uid;
        byEmail.name = name || byEmail.name;
        byEmail.photoURL = picture || byEmail.photoURL;
        await byEmail.save();
        user = await User.findById(byEmail._id).populate('profile');
      }
    }

    // Create a new user + profile if still not found
    if (!user) {
      user = new User({
        uid,
        email,
        name,
        photoURL: picture,
      });

      const profile = new Profile({
        user: user._id,
      });

      await profile.save();

      user.profile = profile._id;
      await user.save();
      // populate profile for response
      await user.populate('profile');
    } else {
      // If user exists, keep their record up-to-date with latest Google profile info
      let changed = false;
      if (name && user.name !== name) {
        user.name = name;
        changed = true;
      }
      if (picture && user.photoURL !== picture) {
        user.photoURL = picture;
        changed = true;
      }
      if (changed) await user.save();
    }

    // Set cookie
    // Ensure the user has a profile (covers cases where an existing user
    // didn't have an associated Profile record). This keeps front-end checks
    // simple and avoids null reference errors elsewhere.
    if (!user.profile) {
      const profile = new Profile({ user: user._id });
      await profile.save();
      user.profile = profile._id;
      await user.save();
      await user.populate('profile');
    }

    // Set cookie
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    };

    res.cookie('token', token, options);

    res.status(200).json({
      success: true,
      data: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Error in handleGoogleSignIn:', error);
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

exports.getMe = (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

// PATCH /api/users/me
// Update current user's profile (name, photoURL). Protected route.
exports.updateMe = async (req, res, next) => {
  try {
    const { name, photoURL } = req.body;

    // req.user is populated by protect middleware
    const user = req.user;
    let changed = false;

    if (typeof name === 'string' && name.trim() !== '' && user.name !== name) {
      user.name = name.trim();
      changed = true;
    }

    if (typeof photoURL === 'string' && photoURL.trim() !== '' && user.photoURL !== photoURL) {
      user.photoURL = photoURL.trim();
      changed = true;
    }

    if (changed) await user.save();

    // Return the updated user populated with profile
    const updated = await User.findById(user._id).populate('profile');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Award points to current user (e.g., after solving a puzzle)
// @route   POST /api/users/me/add-points
// @access  Private
exports.addPoints = async (req, res, next) => {
  try {
    let { points, level } = req.body;

    try { console.debug('addPoints: incoming level:', level, 'typeof:', typeof level); } catch (e) {}

    // 1. Determine points: Level from the enum [1,2,3] takes priority
    // getPointsForLevel will return 10 if level is missing/invalid
    const awardedAmount = (level !== undefined && level !== null) 
      ? getPointsForLevel(level) 
      : (Number(points) || 10);

    // 2. Get user and ensure Profile exists (Auto-healing)
    let user = await User.findById(req.user._id).populate('profile');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let profile = user.profile;

    // user.profile may be an id, a stub, or a populated doc. If it's a stub, fetch the full profile.
    if (profile && typeof profile === 'object' && typeof profile.save !== 'function' && profile._id) {
      profile = await Profile.findById(profile._id);
    }

    // If profile is missing or reference is broken, create it
    if (!profile) {
      profile = await Profile.findOneAndUpdate(
        { user: user._id },
        { user: user._id },
        { upsert: true, new: true }
      );
      user.profile = profile._id;
      await user.save();
    }

    // 3. Update scores (Guaranteed non-zero update)
    profile.totalScore = (profile.totalScore || 0) + awardedAmount;
    profile.puzzlesDone = (profile.puzzlesDone || 0) + 1;
    await profile.save();

    // 4. Return the updated user
    const updatedUser = await User.findById(user._id).populate('profile');

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
