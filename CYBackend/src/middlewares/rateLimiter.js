// src/middlewares/rateLimiter.js

// Production-grade centralized rate-limiting middleware.
// - Uses express-rate-limit with optional Redis-backed store (rate-limit-redis + ioredis).
// - Exports specific limiters for different risk surfaces: auth, submissions, flags, execute, admin.
// - Uses per-user and per-level keys where appropriate to avoid global blocking.
// - Emits structured security logs when limits are exceeded.

const rateLimit = require('express-rate-limit');
let RedisStore;
let IORedis;
try {
  RedisStore = require('rate-limit-redis');
  IORedis = require('ioredis');
} catch (e) {
  // Redis optional. If not present, memory store will be used (not recommended for production).
  RedisStore = null;
  IORedis = null;
}

const slowDown = (() => {
  try {
    return require('express-slow-down');
  } catch (e) {
    return null;
  }
})();

const { logSecurityEvent } = require('../utils/securityLogger');

function parseIntEnv(name, fallback) {
  const v = parseInt(process.env[name], 10);
  return Number.isInteger(v) ? v : fallback;
}

function parseBoolEnv(name, fallback) {
  if (process.env[name] === undefined) return fallback;
  return String(process.env[name]).toLowerCase() === 'true';
}

// Redis store configuration (optional, for distributed rate limiting)
let store = null;
if (process.env.REDIS_URL && RedisStore && IORedis) {
  try {
    const client = new IORedis(process.env.REDIS_URL);
    store = new RedisStore({ sendCommand: (...args) => client.call(...args) });
    console.warn('Rate limiter: using Redis store for rate-limiting');
  } catch (e) {
    console.error('Rate limiter: failed to initialize Redis store, falling back to memory store', e && e.message);
    store = null;
  }
}

// Defaults (env-overridable)
const AUTH_RATE_LIMIT_MAX = parseIntEnv('AUTH_RATE_LIMIT_MAX', 5);
const AUTH_RATE_LIMIT_WINDOW_MS = parseIntEnv('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000);

const SUBMISSION_RATE_LIMIT_MAX = parseIntEnv('SUBMISSION_RATE_LIMIT_MAX', 10);
const SUBMISSION_RATE_LIMIT_WINDOW_MS = parseIntEnv('SUBMISSION_RATE_LIMIT_WINDOW_MS', 60 * 1000);

const FLAG_RATE_LIMIT_MAX = parseIntEnv('FLAG_RATE_LIMIT_MAX', 20);
const FLAG_RATE_LIMIT_WINDOW_MS = parseIntEnv('FLAG_RATE_LIMIT_WINDOW_MS', 5 * 60 * 1000);

const EXECUTE_RATE_LIMIT_MAX = parseIntEnv('EXECUTE_RATE_LIMIT_MAX', 3);
const EXECUTE_RATE_LIMIT_WINDOW_MS = parseIntEnv('EXECUTE_RATE_LIMIT_WINDOW_MS', 10 * 1000);

const ADMIN_RATE_LIMIT_MAX = parseIntEnv('ADMIN_RATE_LIMIT_MAX', 5);
const ADMIN_RATE_LIMIT_WINDOW_MS = parseIntEnv('ADMIN_RATE_LIMIT_WINDOW_MS', 60 * 1000);

const TRUSTED_IPS = (process.env.RATE_LIMIT_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean);

function onLimitExceeded({ req, res, type }) {
  // Structured security log for rate-limit exceeded events
  try {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      limiter: type,
      ip: req.ip,
      userId: req.user?.id || null,
      endpoint: req.originalUrl,
      userAgent: req.get('user-agent') || null,
    });
  } catch (e) {
    // Swallow logging errors
    console.error('Failed to log rate limit event', e && e.message);
  }

  res.status(429).json({ success: false, message: 'Too many requests' });
}

function createLimiter({ windowMs, max, keyGenerator, skip, type }) {
  const opts = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skip,
    handler: (req, res) => onLimitExceeded({ req, res, type }),
  };
  if (store) opts.store = store;
  return rateLimit(opts);
}

// Auth limiter: protect login endpoints. Keyed by IP. Skip successful requests to
// avoid penalizing users who successfully authenticate.
const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skip: (req) => {
    if (TRUSTED_IPS.length && TRUSTED_IPS.includes(req.ip)) return true;
    return false;
  },
  // Do not count successful responses (helpful for auth endpoints)
  skipSuccessfulRequests: true,
  handler: (req, res) => onLimitExceeded({ req, res, type: 'auth' }),
  ...(store ? { store } : {}),
});

// Submission limiter: protect challenge/puzzle submissions. Key by user id or IP.
const submissionLimiter = createLimiter({
  windowMs: SUBMISSION_RATE_LIMIT_WINDOW_MS,
  max: SUBMISSION_RATE_LIMIT_MAX,
  keyGenerator: (req) => (req.user?.id ? `user:${req.user.id}` : req.ip),
  skip: (req) => (TRUSTED_IPS.length && TRUSTED_IPS.includes(req.ip)),
  type: 'submission',
});

// Flag limiter: per-user-and-per-level limiting to mitigate brute-force flag guessing.
const flagLimiter = createLimiter({
  windowMs: FLAG_RATE_LIMIT_WINDOW_MS,
  max: FLAG_RATE_LIMIT_MAX,
  keyGenerator: (req) => `${req.user?.id || req.ip}:${req.params?.level || 'unknown'}`,
  skip: (req) => (TRUSTED_IPS.length && TRUSTED_IPS.includes(req.ip)),
  type: 'flag',
});

// Execute limiter: aggressive limits for endpoints that execute user code/commands.
const executeLimiter = createLimiter({
  windowMs: EXECUTE_RATE_LIMIT_WINDOW_MS,
  max: EXECUTE_RATE_LIMIT_MAX,
  keyGenerator: (req) => (req.user?.id ? `user:${req.user.id}` : req.ip),
  skip: (req) => (TRUSTED_IPS.length && TRUSTED_IPS.includes(req.ip)),
  type: 'execute',
});

// Admin limiter (kept for completeness)
const adminLimiter = createLimiter({
  windowMs: ADMIN_RATE_LIMIT_WINDOW_MS,
  max: ADMIN_RATE_LIMIT_MAX,
  keyGenerator: (req) => (req.user?.id ? `user:${req.user.id}` : req.ip),
  skip: (req) => (TRUSTED_IPS.length && TRUSTED_IPS.includes(req.ip)),
  type: 'admin',
});

module.exports = {
  authLimiter,
  submissionLimiter,
  flagLimiter,
  executeLimiter,
  adminLimiter,
};
