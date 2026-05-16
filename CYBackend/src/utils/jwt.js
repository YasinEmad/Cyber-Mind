const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET is not set. Use a strong secret in production.');
}

exports.signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
