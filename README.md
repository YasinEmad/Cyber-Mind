# Cyber-Mind
Cybermind is an interactive website for learning cybersecurity. It offers puzzles, challenges, and games to build practical skills. The goal is to make security education engaging and hands-on.

## Authentication (Google-only)

Recent update: the site now supports Google and GitHub Sign-In via Firebase. Users sign in with their OAuth provider (Google or GitHub); on first sign-in we automatically create a user record in the database using the account data (name, image, email, uid). Users can later edit their display name / avatar within the application.

Backend: POST /api/users/auth/google accepts a Firebase ID token, verifies it using the Firebase Admin SDK, and creates or updates a User + Profile. A secure httpOnly cookie is used for session persistence.

Profile edits: authenticated users can PATCH /api/users/me with { name, photoURL } to update their account info.
