---
name: SidkoUniverse storage architecture
description: How content is stored in the SidkoUniverse app — critical for any future data work.
---

## Rule
All content (memories, thoughts, posts, music, ngl, guestbook, settings, goals, timeline, journal) is stored as **local JSON files** on the API server, NOT in Firebase Firestore.

**Why:** Firebase service account key (`FIREBASE_SERVICE_ACCOUNT_KEY`) was never set up. Rather than requiring that secret, all Firestore-dependent features were migrated to local JSON API routes during the debugging audit.

## Storage file locations (relative to `artifacts/api-server/`)
- `memories.json`, `thoughts.json`, `posts.json`, `music.json`
- `ngl.json`, `guestbook.json`, `settings.json`
- `goals.json` — added during audit
- `timeline.json` — added during audit
- `journal.json` — added during audit (was previously Firestore per-user)

## API routes (all in `artifacts/api-server/src/routes/`)
- Public read: GET `/api/goals`, GET `/api/timeline`, GET `/api/memories`, GET `/api/thoughts`, GET `/api/posts`, GET `/api/music`, GET `/api/guestbook`
- Admin write: POST/PATCH/DELETE with `Authorization: Bearer <token>` header
- Admin-only: `/api/journal`, `/api/ngl/all`, `/api/settings`

## Firebase status
- Firebase client SDK is initialized (`isFirebaseConfigured = true`) because all `VITE_FIREBASE_*` env vars are set.
- `useFirestore` hook, `firestoreApi.ts`, Firestore-based reads/writes were all REMOVED from production pages.
- `routes/firestore.ts` still exists as a stub but is unused by any current frontend page.
- Journal previously stored at `journal_${user.uid}` in Firestore; now stored in flat `journal.json` (single admin, no per-user distinction needed).

## Auth
- Admin token stored in `sessionStorage` via `adminAuth.ts`
- `withAdminHeaders()` attaches `Authorization: Bearer <token>` header
- Cookie-based auth also works through Vite proxy for `credentials: 'include'` calls

**How to apply:** Any new content feature should use local JSON route pattern (see `goals.ts` as template). Do NOT add Firestore reads/writes without first confirming `FIREBASE_SERVICE_ACCOUNT_KEY` is set.
