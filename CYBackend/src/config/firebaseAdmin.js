const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, 'firebase-service-account.json');

let serviceAccount;
try {
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error('Firebase service account file not found at ' + serviceAccountPath);
  }

  serviceAccount = require(serviceAccountPath);

  const requiredFields = [
    'type', 
    'project_id', 
    'private_key_id', 
    'private_key', 
    'client_email', 
    'client_id'
  ];
  const missingField = requiredFields.find(field => !serviceAccount[field]);

  if (missingField) {
    throw new Error(`Firebase service account is missing required field: ${missingField}`);
  }
} catch (error) {
  console.error('Failed to load Firebase service account:', error.message);
  process.exit(1);
}

// Initialize Admin SDK only if not initialized already
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
