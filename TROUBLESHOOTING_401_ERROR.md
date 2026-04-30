# Troubleshooting: 401 Unauthorized Error When Creating Templates

## Problem
You see the error: **"Not authorized - Please log in as an admin user to create templates"**

This means the system cannot create a template because:
- ❌ You're not logged into the application, OR
- ❌ You're logged in but don't have admin role, OR  
- ❌ Your authentication token is invalid/expired

---

## Solution: Step-by-Step

### Step 1: Verify You're Logged In
1. **Check the top-right corner** of the application
   - If you see a **profile icon/name** → You're logged in ✓
   - If you see **"Login"** button → You're NOT logged in ✗

### Step 2: If NOT Logged In → Login Now
1. Click the **"Login"** button (usually in top-right)
2. Use your **admin account credentials**:
   - Email: Your admin email
   - Password: Your admin password
3. Log in successfully

### Step 3: If Already Logged In → Check Admin Role
1. Go to **Profile** (usually top-right menu)
2. Look for: **"Role: Admin"** or **"Admin Status: ✓"**
   - If you see "**Role: User**" → You DON'T have admin permissions ✗
   - If you see "**Role: Admin**" → You have admin permissions ✓

### Step 4: If You DON'T Have Admin Role
**Contact your system administrator** and provide:
- Your email address
- Request to grant admin access
- Once approved, log out and log back in

### Step 5: Refresh and Try Again
1. **Close** the Admin panel (click "Close" button)
2. **Reopen** the Admin panel
3. Try to **create a new template** again
4. The template should now be created successfully!

---

## Why Does This Happen?

The template creation endpoint requires:
```
✓ User must be logged in (have valid Firebase ID token)
✓ User must have admin role in the database
✓ Request must include Authorization header with valid token
```

When you're not logged in or don't have admin role, the backend returns **401 Unauthorized**.

---

## Quick Verification Checklist

- [ ] I'm logged into the application (can see my profile)
- [ ] My profile shows "Role: Admin"
- [ ] I closed and reopened the admin panel after logging in
- [ ] I'm using the correct admin email/password
- [ ] The error message now shows helpful information

---

## Still Getting the Error?

Try these additional steps:

### Clear Browser Cache
1. Press `F12` (or `Ctrl+Shift+I` / `Cmd+Option+I`)
2. Go to **Application** tab
3. Click **Clear storage** / **Clear all**
4. Reload the page (press `F5`)

### Check Browser Console
1. Press `F12` (Developer Tools)
2. Go to **Console** tab
3. Look for error messages
4. Share any error messages with your administrator

### Verify Backend is Running
1. The backend API must be running on `http://localhost:8080`
2. Check if backend server is started
3. If not running, start it: `npm start` from the `CYBackend` folder

### Verify Frontend is Connected to Backend
1. Check the browser's **Network** tab (in Developer Tools)
2. Look for requests to `/api/templates`
3. Verify they're going to the correct URL: `http://localhost:8080/api/templates`

---

## Common Scenarios

### Scenario 1: Fresh Login
```
✓ Just logged in for the first time
✓ Close admin panel and reopen
✓ Try creating template again
```

### Scenario 2: Admin Role Just Granted
```
✓ Admin just gave you access
✓ Log out completely
✓ Log back in with your credentials  
✓ Try creating template
```

### Scenario 3: Token Expired
```
✓ Been idle for a while (hours)
✓ Session token expired
✓ Refresh the page (F5)
✓ Try creating template again
```

### Scenario 4: Multiple Logins
```
✓ Logged in with wrong account
✓ Log out
✓ Log in with ADMIN account
✓ Try creating template
```

---

## What the System Needs

For template creation to work, ensure:

1. **Firebase Authentication**
   - User exists in Firebase
   - User is logged in
   - ID token is valid

2. **Database User Record**
   - User exists in the database
   - User has `role: 'admin'`

3. **Request Headers**
   - `Authorization: Bearer <valid_id_token>`
   - Sent with the POST request

4. **Backend API**
   - Must be running on port 8080
   - Template creation endpoint must be accessible

---

## Token Refresh Mechanism

The system automatically:
- Gets a fresh token before each request
- Sends it in the Authorization header
- If token invalid → 401 error
- If user not logged in → No token sent → 401 error

**Solution:** Log in again and the token will be automatically refreshed.

---

## Debug Mode: Advanced

### Check if Token is Being Sent
```javascript
// In browser console (F12):
import { auth } from '@/firebase';
if (auth.currentUser) {
  auth.currentUser.getIdToken(true).then(token => {
    console.log('Your auth token:', token.slice(0, 50) + '...');
  });
} else {
  console.log('No user logged in!');
}
```

### Verify Admin Role
```javascript
// In browser console (F12):
// The server must return user.role === 'admin'
// This is checked in the backend authAdmin middleware
```

---

## Summary

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Log in with admin account |
| Permission Denied (403) | Contact admin for access |
| Token Expired | Refresh page or log in again |
| Backend Unreachable | Start backend server |
| Template still not creating | Clear cache and reload |

---

**Need help?** Share this with your system administrator with the error message and browser console logs.
