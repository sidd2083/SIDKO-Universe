---
name: Firebase Admin Secret Required
description: All Firestore data routes require FIREBASE_SERVICE_ACCOUNT_KEY — without it every /api route returns 500.
---

## Rule
Every data route (posts, thoughts, memories, ngl, music, etc.) calls `getAdminFirestore()` from `artifacts/api-server/src/lib/firebaseAdmin.ts`. That function throws if `FIREBASE_SERVICE_ACCOUNT_KEY` is not set. The error surfaces as a generic 500.

**Why:** The routes were migrated from local JSON files to Firestore. The secret is the Firebase Admin SDK service account JSON (downloaded from Firebase console → Project settings → Service accounts → Generate new private key).

**How to apply:** If any /api data route returns 500, check this secret first before debugging route code. Set it in Replit Secrets as `FIREBASE_SERVICE_ACCOUNT_KEY` (the entire JSON file contents as a string).
