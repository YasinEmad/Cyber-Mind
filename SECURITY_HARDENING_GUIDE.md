# Cyber-Mind: Security Hardening & Best Practices Guide

## Overview

This document provides detailed security recommendations and implementation patterns to protect the Cyber-Mind platform against common web vulnerabilities. Follow this guide in priority order.

---

## Table of Contents

1. [Critical Security Issues](#critical-security-issues)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Frontend Security](#frontend-security)
6. [Infrastructure Security](#infrastructure-security)
7. [Security Checklist](#security-checklist)

---

## Critical Security Issues

### 1. 🔴 Firebase Credentials in Repository

**Risk Level:** CRITICAL

**Issue:**
```
firebase-service-account.json should NEVER be committed to Git
```

**Current Problem:**
```
CYBackend/src/config/firebase-service-account.json
↓ This file contains:
- private_key
- client_email
- project_id
↓
If exposed, attacker can impersonate your Firebase project
```

**Fix:**

**Step 1:** Remove the file from git history
```bash
cd CYBackend
git rm --cached src/config/firebase-service-account.json
echo "src/config/firebase-service-account.json" >> .gitignore
git commit -m "Remove Firebase credentials from repo"
```

**Step 2:** Create `.env` entry
```env
# CYBackend/.env
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Step 3:** Update code to load from environment
```javascript
// CYBackend/src/config/firebaseAdmin.js

let serviceAccount;

try {
  // First, try to load from environment variable (production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    // Fall back to file for development (file must be in .gitignore)
    const fs = require('fs');
    const path = require('path');
    const serviceAccountPath = path.resolve(__dirname, 'firebase-service-account.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Firebase credentials not found');
    }
    
    serviceAccount = require(serviceAccountPath);
  }

  const requiredFields = [
    'type', 'project_id', 'private_key_id', 'private_key',
    'client_email', 'client_id'
  ];
  
  const missingField = requiredFields.find(field => !serviceAccount[field]);
  if (missingField) {
    throw new Error(`Firebase service account is missing: ${missingField}`);
  }

} catch (error) {
  console.error('❌ Failed to load Firebase credentials:', error.message);
  process.exit(1);
}

// Rest of initialization...
```

---

### 2. 🔴 No Input Validation

**Risk Level:** CRITICAL

**Vulnerabilities:**
- NoSQL injection
- XSS (Cross-Site Scripting)
- Command injection
- Buffer overflow

**Fix:**

**Install validation library:**
```bash
cd CYBackend
npm install joi --save
npm install --save-dev @types/joi
```

**Create validation schemas:**
```javascript
// CYBackend/src/utils/validation.js

const Joi = require('joi');

exports.puzzleSubmissionSchema = Joi.object({
  answer: Joi.string()
    .required()
    .max(500)
    .trim()
    .messages({
      'string.empty': 'Answer is required',
      'string.max': 'Answer must not exceed 500 characters'
    })
});

exports.userUpdateSchema = Joi.object({
  name: Joi.string()
    .optional()
    .max(100)
    .trim()
    .pattern(/^[a-zA-Z\s'-]+$/)
    .messages({
      'string.pattern.base': 'Name contains invalid characters'
    }),
  photoURL: Joi.string()
    .optional()
    .uri()
    .messages({
      'string.uri': 'Photo URL must be a valid URL'
    })
});

exports.puzzleCreationSchema = Joi.object({
  title: Joi.string().required().max(200).trim(),
  description: Joi.string().required().max(2000).trim(),
  level: Joi.number().required().valid(1, 2, 3),
  scenario: Joi.string().required().max(3000).trim(),
  tag: Joi.string().required().unique().alphanum(),
  answer: Joi.string().required().max(500),
  category: Joi.string().required().max(100),
  hints: Joi.array().items(Joi.string().max(500)).max(10),
  active: Joi.boolean().default(true)
});
```

**Create validation middleware:**
```javascript
// CYBackend/src/middlewares/validate.js

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    req.validated = value;
    next();
  };
};

module.exports = validate;
```

**Apply to routes:**
```javascript
// CYBackend/src/routes/puzzleRoutes.js

const validate = require('../middlewares/validate');
const { puzzleSubmissionSchema } = require('../utils/validation');

router.post('/:id/submit', 
  validate(puzzleSubmissionSchema), 
  optionalAuth, 
  submitAnswer
);
```

---

### 3. 🔴 No Rate Limiting

**Risk Level:** CRITICAL

**Attack Scenario:**
```
Attacker makes 1000 requests/second to POST /puzzles/:id/submit
↓
Brute forces puzzle answers
↓
Gains unlimited points
```

**Fix:**

**Install rate limiter:**
```bash
npm install express-rate-limit redis --save
```

**Configure rate limiting:**
```javascript
// CYBackend/src/config/rateLimiter.js

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// General API limiter: 100 requests per 15 minutes
exports.apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for answer submissions: 10 per minute per user
exports.submissionLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:submit:'
  }),
  windowMs: 1 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.uid || req.ip, // Per user or per IP
  message: 'Too many submission attempts, please try again in 1 minute'
});

// Brute force login limiter: 5 per hour per IP
exports.loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:login:'
  }),
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});
```

**Apply to routes:**
```javascript
// CYBackend/src/server.js

const { apiLimiter, submissionLimiter, loginLimiter } = require('./config/rateLimiter');

// Apply general limiter to all API routes
app.use('/api/', apiLimiter);

// Apply strict limiter to submissions
app.post('/api/puzzles/:id/submit', submissionLimiter, submitAnswer);
app.post('/api/challenges/:id/submit', submissionLimiter, submitAnswer);

// Apply login limiter
app.post('/api/users/auth/google', loginLimiter, handleGoogleSignIn);
```

---

### 4. 🔴 No HTTPS Enforcement

**Risk Level:** CRITICAL

**Fix:**

**Production Configuration:**
```javascript
// CYBackend/src/server.js

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Set secure cookie flag
const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // ✓ HTTPS only
    sameSite: 'Strict', // Prevent CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};
```

---

## Authentication & Authorization

### 1. Secure Token Handling

**Best Practice:**
```javascript
// ✓ GOOD - Token in httpOnly cookie
const cookieOptions = {
  httpOnly: true,    // Not accessible via JavaScript
  secure: true,      // HTTPS only
  sameSite: 'Strict' // CSRF protection
};
res.cookie('token', token, cookieOptions);

// ✗ BAD - Token in localStorage (vulnerable to XSS)
localStorage.setItem('token', token);
```

---

### 2. Token Refresh Strategy

**Issue:** Firebase ID tokens expire after 1 hour

**Solution:**
```typescript
// CYFrontend/src/api/axios.ts

instance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        // Get fresh token
        const newToken = await auth.currentUser?.getIdToken(true);
        if (newToken) {
          // Retry original request with new token
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return instance(error.config);
        }
      } catch (refreshError) {
        // Token refresh failed - clear auth
        dispatch(clearUser());
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 3. Admin Role Verification

**Current Issue:** Admin check doesn't verify Firebase claims

**Fix:**
```javascript
// CYBackend/src/middlewares/auth.js

exports.authAdmin = async (req, res, next) => {
  // First, verify user is authenticated
  await exports.protect(req, res, async () => {
    // Check both role in MongoDB and Firebase custom claims
    const user = req.user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Optional: Verify with Firebase admin claims
    try {
      const customClaims = await admin.auth().getUser(user.uid);
      if (customClaims.customClaims?.admin !== true) {
        console.warn(`User ${user.uid} role mismatch with Firebase`);
      }
    } catch (err) {
      console.error('Firebase verification error:', err.message);
      // Don't block, but log the issue
    }

    next();
  });
};
```

---

### 4. Session Invalidation

**Add logout endpoint that invalidates tokens:**
```javascript
// CYBackend/src/controllers/userController.js

exports.logout = async (req, res) => {
  try {
    if (req.user) {
      // Revoke Firebase refresh tokens (optional)
      await admin.auth().revokeRefreshTokens(req.user.uid);
      
      // Clear auth cookie
      res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      });
    }

    res.status(200).json({ success: true, message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## Data Protection

### 1. Sensitive Data in Database

**Current Issue:** Puzzle answers and challenge solutions always hidden

**Verification:**
```javascript
// ✓ CORRECT - Answer field has select: false
puzzleSchema.add({
  answer: {
    type: String,
    required: true,
    select: false // Never retrieved by default
  }
});

// When you need the answer (validation only):
const puzzle = await Puzzle.findById(id).select('+answer');
```

**Never expose sensitive fields:**
```javascript
// ✗ WRONG - Exposes answer
res.json(await Puzzle.findById(id));

// ✓ CORRECT - Only expose safe fields
const puzzle = await Puzzle.findById(id);
res.json({
  _id: puzzle._id,
  title: puzzle.title,
  description: puzzle.description,
  category: puzzle.category,
  level: puzzle.level,
  hints: puzzle.hints
  // NO answer
});
```

---

### 2. Password/Credential Storage

**For Future Implementation (if needed):**
```javascript
// Install: npm install bcryptjs
const bcrypt = require('bcryptjs');

// Hash password before storing
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// Verify password
const isCorrect = await bcrypt.compare(plainPassword, hashedPassword);

// ✗ NEVER DO THIS
database.save({ password: plainPassword }); // WRONG!
```

---

### 3. PII (Personally Identifiable Information) Protection

**Principle: Minimize collection, encrypt in transit**

```javascript
// Current data collected from Firebase:
// - uid (unique identifier)
// - email (verified)
// - name (optional)
// - photoURL (optional)
// - picture (from OAuth provider)

// These are necessary for user identification
// Ensure:
// 1. Email verification enabled ✓
// 2. HTTPS in production ✓
// 3. HttpOnly cookies ✓
```

---

## API Security

### 1. Add Security Headers

**Install middleware:**
```bash
npm install helmet --save
```

**Apply to all routes:**
```javascript
// CYBackend/src/server.js

const helmet = require('helmet');

// Apply helmet to set security headers
app.use(helmet());

// Customize if needed
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' }
}));
```

**Headers Added:**
- `X-Frame-Options: DENY` (Clickjacking protection)
- `X-Content-Type-Options: nosniff` (MIME type sniffing)
- `Strict-Transport-Security` (HTTPS enforcement)
- `X-XSS-Protection: 1; mode=block`

---

### 2. CORS Configuration

**Current config (Update for production):**
```javascript
// CYBackend/src/server.js

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));
```

**Production .env:**
```env
ALLOWED_ORIGINS=https://cyber-mind.com,https://www.cyber-mind.com
```

---

### 3. SQL/NoSQL Injection Prevention

**MongoDB Injection Example:**
```javascript
// ✗ VULNERABLE
const user = await User.findOne({ email: req.body.email });
// If email = { $ne: null }, finds any user!

// ✓ SAFE (with validation)
const { email } = req.validated; // Joi validated
const user = await User.findOne({ email });

// Or explicit schema validation
const user = await User.findOne({
  email: String(email).toLowerCase()
});
```

---

### 4. Error Message Disclosure

**Issue:** Error messages leak system details

**Fix:**
```javascript
// ✗ BAD - Exposes internal details
catch (error) {
  res.status(500).json({
    message: error.message, // "Cast to ObjectId failed..."
    stack: error.stack
  });
}

// ✓ GOOD - Safe error message
catch (error) {
  console.error(error); // Log internally
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An error occurred'
      : error.message
  });
}
```

---

## Frontend Security

### 1. XSS (Cross-Site Scripting) Prevention

**React handles HTML escaping by default:**
```typescript
// ✓ SAFE - Text is automatically escaped
<div>{userContent}</div>

// ✗ DANGEROUS - HTML is rendered
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// Use only for trusted content with sanitization
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

---

### 2. Secure Local Storage Usage

**Best Practices:**
```typescript
// ✗ DON'T store tokens in localStorage
localStorage.setItem('token', token); // Vulnerable to XSS

// ✓ DO use httpOnly cookies (backend sets)
// Frontend never touches it

// Safe to store in localStorage:
localStorage.setItem('userId', userId);
localStorage.setItem('userPreferences', JSON.stringify(preferences));
```

---

### 3. CSP Headers (Content Security Policy)

**Configure in frontend build:**
```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; 
           style-src 'self' 'unsafe-inline' cdn.jsdelivr.net;
           img-src 'self' data: https:;
           connect-src 'self' https://api.example.com;">
```

---

### 4. Dependency Vulnerabilities

**Check for known vulnerabilities:**
```bash
cd CYFrontend
npm audit

# Fix automatically (if safe)
npm audit fix

# Check specific package
npm audit --fix [package-name]
```

---

## Infrastructure Security

### 1. Environment Configuration

**Create .env.example (with dummy values):**
```env
# CYBackend/.env.example
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...iam.gserviceaccount.com
NODE_ENV=development
PORT=8080
REDIS_HOST=localhost
REDIS_PORT=6379
ALLOWED_ORIGINS=http://localhost:5173
```

**Never commit .env with real values:**
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "firebase-service-account.json" >> .gitignore
```

---

### 2. Database Access Control

**MongoDB:**
- Enable IP whitelist (Atlas → Network Access)
- Use strong passwords (32+ characters, mixed case)
- Create limited-scope users if possible
- Enable database audit logging

```javascript
// Use connection string with credentials
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cyber-mind?retryWrites=true&w=majority
```

---

### 3. Firebase Security Rules

**Enable proper Firebase rules:**
```json
// Firebase Console → Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Only allow authenticated users
      allow read, write: if request.auth != null;
      
      // Only admin can delete
      allow delete: if request.auth.token.admin == true;
    }
  }
}
```

---

### 4. Dependency Management

**Keep dependencies updated:**
```bash
# Check for updates
npm outdated

# Update safely
npm update

# Major version updates (manual review)
npm install package@latest
```

**Lock dependency versions:**
```json
// package-lock.json or yarn.lock
// Always commit lock files!
```

---

## Security Checklist

### Before Production Deployment

**Critical (Must Fix):**
- [ ] Remove Firebase credentials from git
- [ ] Enable HTTPS with SSL/TLS certificate
- [ ] Add rate limiting to sensitive endpoints
- [ ] Implement input validation (Joi/Yup)
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Configure CORS properly for production URL
- [ ] Enable Node.js security headers (Helmet)
- [ ] Set NODE_ENV=production

**Important (Should Fix):**
- [ ] Add request logging (Morgan)
- [ ] Implement centralized error handling
- [ ] Add monitoring/alerting (Sentry, DataDog)
- [ ] Enable database encryption at rest
- [ ] Set up backups and recovery procedures
- [ ] Document security procedures
- [ ] Run dependency security audit

**Nice to Have:**
- [ ] Add Web Application Firewall (WAF)
- [ ] Implement API versioning
- [ ] Add request signing for sensitive operations
- [ ] Implement audit logging for admin actions
- [ ] Set up DDoS protection

---

### Regular Security Maintenance

**Weekly:**
- [ ] Review error logs for anomalies
- [ ] Check for failed auth attempts

**Monthly:**
- [ ] Update dependencies: `npm update && npm audit`
- [ ] Review user permissions and roles
- [ ] Backup critical data

**Quarterly:**
- [ ] Security audit of codebase
- [ ] Penetration testing
- [ ] Review access logs

**Annually:**
- [ ] Full security audit
- [ ] Update security policies
- [ ] Staff security training

---

## Incident Response

### If Credentials are Exposed

1. **IMMEDIATELY:**
   - Revoke all Firebase credentials
   - Rotate MongoDB passwords
   - Review access logs

2. **Within 1 hour:**
   - Generate new Firebase service account
   - Update all environment variables
   - Redeploy services

3. **Within 24 hours:**
   - Audit all user accounts
   - Check for unauthorized access
   - Notify users if necessary

---

### If Database is Compromised

1. **Preserve Evidence:**
   - Don't delete logs
   - Take snapshots of affected data

2. **Contain:**
   - Rotate all credentials
   - Update firewall rules

3. **Investigate:**
   - Review access logs
   - Identify compromised data
   - Determine scope of breach

4. **Notify:**
   - Inform users if PII exposed
   - Follow GDPR/privacy laws
   - Document incident

---

## Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Firebase Security](https://firebase.google.com/docs/database/security)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Reviewed By:** Security Team
