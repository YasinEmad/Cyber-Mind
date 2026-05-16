# Fix Firebase "aud" Claim Error

The error indicates that the Firebase service account credentials used by the backend are either:
1. Invalid or expired
2. Mismatched with the current Firebase project configuration

## Solution: Regenerate Firebase Service Account

Follow these steps to fix the issue:

### 1. Go to Firebase Console
- Navigate to [Firebase Console](https://console.firebase.google.com/)
- Select your project: **cyber-mind-6f341**

### 2. Create New Service Account
- Go to **Project Settings** → **Service Accounts** tab
- Click **Generate New Private Key**
- Download the new service account JSON file

### 3. Update Backend Credentials

**Option A: Use Environment Variables (Recommended for Production)**
```bash
# Copy the downloaded JSON file contents
# Set in your backend .env or Render environment variables:

FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"cyber-mind-6f341",...}'

# Or individual variables:
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=cyber-mind-6f341
FIREBASE_PRIVATE_KEY_ID=your_new_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@cyber-mind-6f341.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_new_client_id
```

**Option B: Update Local File (Development Only)**
```bash
# Replace CYBackend/src/config/firebase-service-account.json with the downloaded file
# (Do NOT commit to git)
```

### 4. Update Render Environment Variables
For the production deployment on Render:
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update `FIREBASE_SERVICE_ACCOUNT` or individual `FIREBASE_*` variables
5. Trigger a new deploy

### 5. Verify Frontend Configuration
Ensure `CYFrontend/.env` has the correct Firebase API key for project `cyber-mind-6f341`:
```
VITE_FIREBASE_PROJECT_ID=cyber-mind-6f341
VITE_FIREBASE_API_KEY=AIzaSyAMSbpu8m2ibgURNkkKIlJ_2yajqhClLbM
```

### 6. Test the Fix
After deploying, test token verification:
```bash
curl -s https://cyber-mind.onrender.com/api/users/profile \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

This should now return a proper response instead of "aud" claim error.
