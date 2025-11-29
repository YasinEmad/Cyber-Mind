const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const Profile = require('../models/Profile');

exports.handleFirebaseLogin = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token not provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email_verified) {
      return res.status(401).json({ success: false, message: 'Email not verified' });
    }

    let user = await User.findOne({ uid });

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
    console.error('Error in handleFirebaseLogin:', error);
    next(error);
  }
};

exports.handleFirebaseRegister = async (req, res, next) => {
  const { token, username } = req.body;

  if (!token || !username) {
    return res.status(401).json({ success: false, message: 'Token or username not provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, picture, email_verified } = decodedToken;

    if (!email_verified) {
      return res.status(401).json({ success: false, message: 'Email not verified' });
    }

    let user = await User.findOne({ uid });

    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = new User({
      uid,
      email,
      name: username,
      photoURL: picture,
    });

    const profile = new Profile({
      user: user._id,
    });

    await profile.save();

    user.profile = profile._id;
    await user.save();

    // Set cookie
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    };

    res.cookie('token', token, options);

    res.status(201).json({
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
    console.error('Error in handleFirebaseRegister:', error);
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
