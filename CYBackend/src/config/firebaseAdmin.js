const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

try {
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error('Firebase service account file not found!');
  }

  const serviceAccount = require(serviceAccountPath);

  const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
  const missingField = requiredFields.find(field => !serviceAccount[field]);

  if (missingField) {
    throw new Error(`Firebase service account is missing required field: ${missingField}`);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin SDK initialized successfully.');

} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  // Exit the process if Firebase Admin SDK fails to initialize
  process.exit(1);
}

module.exports = admin;
