---
name: SidkoUniverse storage architecture
description: How content and files are stored in the SidkoUniverse app — critical for any future data or upload work.
---

## Rule
All content (memories, thoughts, posts, music, ngl, guestbook, settings, goals, timeline, journal) is stored in **Firebase Firestore** via the API server using the Admin SDK (`FIREBASE_SERVICE_ACCOUNT_KEY`).

**Why:** The API server uses `firebase-admin` + `FIREBASE_SERVICE_ACCOUNT_KEY` to read/write Firestore server-side. The client-side Firebase SDK (`VITE_FIREBASE_*`) is also initialized in the browser but content reads go through the API, not direct Firestore client calls.

## File/media uploads
- Uploads go to **Firebase Storage** via `POST /api/upload` (admin-only)
- Stored at path `uploads/<timestamp>-<random>.<ext>` in bucket `<FIREBASE_PROJECT_ID>.firebasestorage.app`
- Made public after upload; returned URL is `https://storage.googleapis.com/<bucket>/uploads/<filename>` — permanent, no token needed
- Multer uses **memoryStorage** (no local disk writes)
- Route: `artifacts/api-server/src/routes/upload.ts`

## Required secrets (all now set)
- `FIREBASE_SERVICE_ACCOUNT_KEY` — full service account JSON for Firestore + Storage Admin SDK
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — admin dashboard login at `/balen`
- `SESSION_SECRET` — signs the admin session cookie

## Auth
- Admin token stored in `sessionStorage` via `adminAuth.ts`
- `withAdminHeaders()` attaches `Authorization: Bearer <token>` header
- Cookie-based auth also works through Vite proxy for `credentials: 'include'` calls

**How to apply:** New content features should use Firestore via `getAdminFirestore()` from `artifacts/api-server/src/lib/firebaseAdmin.ts`. New media uploads go through Firebase Storage via `getAdminStorage()` from the same lib. Do not write uploaded files to local disk.
