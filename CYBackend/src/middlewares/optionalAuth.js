const admin = require('../config/firebaseAdmin');
const User = require('../models/User');

/**
 * Optional auth middleware — tries to authenticate the request if a token
 * is present (Authorization header or cookie). If no token is present we
 * just continue without error (req.user will be null). If a token is present
 * and valid we attach the user to req.user so downstream handlers can act
 * as if they were protected.
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // find the user document
    let user = await User.findOne({ uid: decodedToken.uid });
    // If this is a mongoose document with populate, populate it; if the
    // findOne mock returns a plain object (tests), just keep it.
    if (user && typeof user.populate === 'function') {
      await user.populate('profile');
    }

    req.user = user || null;
    return next();
  } catch (err) {
    // token failed / invalid — treat as unauthenticated but continue
    console.debug('optionalAuth: token verify failed — continuing as guest');
    req.user = null;
    return next();
  }
};

module.exports = { optionalAuth };
