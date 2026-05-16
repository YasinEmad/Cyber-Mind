require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, 'firebase-service-account.json');

const requiredFields = [
  'type',
  'project_id',
  'private_key_id',
  'private_key',
  'client_email',
  'client_id'
];

function stripQuotes(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function normalizePrivateKey(value) {
  const stripped = stripQuotes(value);
  return typeof stripped === 'string' ? stripped.replace(/\\n/g, '\n') : stripped;
}

function normalizeField(value) {
  if (typeof value !== 'string') return value;
  return stripQuotes(value);
}

function parseJsonEnv(value) {
  const stripped = stripQuotes(value);
  const parsed = JSON.parse(stripped);
  if (typeof parsed === 'string') {
    return JSON.parse(parsed);
  }
  return parsed;
}

function loadServiceAccountFromEnv() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = parseJsonEnv(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (parsed.private_key) {
        parsed.private_key = normalizePrivateKey(parsed.private_key);
      }
      return parsed;
    } catch (error) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON: ' + error.message);
    }
  }

  const envRequired = [
    'FIREBASE_TYPE',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID'
  ];

  const hasEnvConfig = envRequired.every(key => !!process.env[key]);
  if (!hasEnvConfig) {
    return null;
  }

  return {
    type: normalizeField(process.env.FIREBASE_TYPE),
    project_id: normalizeField(process.env.FIREBASE_PROJECT_ID),
    private_key_id: normalizeField(process.env.FIREBASE_PRIVATE_KEY_ID),
    private_key: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    client_email: normalizeField(process.env.FIREBASE_CLIENT_EMAIL),
    client_id: normalizeField(process.env.FIREBASE_CLIENT_ID),
    auth_uri: normalizeField(process.env.FIREBASE_AUTH_URI) || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: normalizeField(process.env.FIREBASE_TOKEN_URI) || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: normalizeField(process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL) || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: normalizeField(process.env.FIREBASE_CLIENT_X509_CERT_URL) || '',
    universe_domain: normalizeField(process.env.FIREBASE_UNIVERSE_DOMAIN) || 'googleapis.com'
  };
}

let serviceAccount;
try {
  serviceAccount = loadServiceAccountFromEnv();
  if (!serviceAccount) {
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT or individual FIREBASE_* environment variables.');
    }
    serviceAccount = require(serviceAccountPath);
  }

  requiredFields.forEach((field) => {
    if (serviceAccount[field] && typeof serviceAccount[field] === 'string') {
      serviceAccount[field] = normalizeField(serviceAccount[field]);
    }
  });

  const missingField = requiredFields.find(field => !serviceAccount[field]);
  if (missingField) {
    throw new Error(`Firebase service account is missing required field: ${missingField}`);
  }
} catch (error) {
  console.error('Failed to load Firebase service account:', error.message);
  process.exit(1);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    process.exit(1);
  }
} else {
  console.log('Firebase Admin SDK already initialized.');
}

module.exports = admin;
