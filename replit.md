# SidkoUniverse

Siddhant's personal site: a public blog/portfolio ("digital life" journal — memories, thoughts, blog, timeline, goals, guestbook, anonymous Q&A) plus a private admin dashboard for managing that content.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/sidkouniverse run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secrets: `SESSION_SECRET` (signs the admin session cookie), `ADMIN_USERNAME`, `ADMIN_PASSWORD` (admin login credentials for `/balen`)
- Optional env (unset today): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` — needed to make Firestore-backed content (memories, blog, thoughts, guestbook, NGL, dashboard editors) actually work. See "Gotchas" below.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5, cookie-based admin session auth (HMAC-signed cookie, no external auth provider)
- Web: React + Vite (`artifacts/sidkouniverse`)
- DB: PostgreSQL + Drizzle ORM (provisioned, schema currently empty — not yet used by the app)
- Content storage today: Firebase Firestore/Storage client SDK (`src/lib/firebase.ts`) — **not configured**, see Gotchas
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sidkouniverse` — the web app (public pages + `/dashboard/*` admin pages + `/balen` admin login)
- `artifacts/api-server` — Express API; admin auth routes in `src/routes/auth.ts`, session helper in `src/lib/adminSession.ts`
- `lib/api-spec/openapi.yaml` — source of truth for the API contract (includes `/auth/login`, `/auth/logout`, `/auth/me`)
- `lib/api-client-react` / `lib/api-zod` — generated from the OpenAPI spec via Orval; don't hand-edit, run codegen instead

## Architecture decisions

- **Admin auth is intentionally separate from Firebase.** Admin login (`/balen`, username/password) is handled entirely by the API server via an HMAC-signed httpOnly cookie (`admin_session`), checked against the `ADMIN_USERNAME`/`ADMIN_PASSWORD` secrets. This does not depend on Firebase being configured.
- **Regular visitor accounts** (`/login`, `/register`, `/profile`) are a separate, unrelated identity system still backed by Firebase Auth. They stay non-functional until a real Firebase project is connected (see Gotchas) — this was out of scope for the admin-login fix.
- **Firebase is initialized defensively.** `src/lib/firebase.ts` only calls `initializeApp`/`getFirestore`/`getStorage` if all required `VITE_FIREBASE_*` vars are present (`isFirebaseConfigured`). Any code touching `db`/`storage` must check `isFirebaseConfigured` first or wrap the call, since `db`/`storage` can be `null`.
- A top-level `ErrorBoundary` wraps all routed pages so a single broken page (e.g. one hitting Firestore while it's unconfigured) shows a "page couldn't load" fallback instead of taking down the whole app.

## Product

- Public: Home, Memories, Thoughts, Blog, Timeline, Goals, Achievements, Learning, About, NGL (anonymous Q&A), Guestbook, Messages (placeholder).
- Admin (`/balen` login → `/dashboard`): content managers for memories, thoughts, blog, goals, anonymous messages, music, timeline, a journal, and settings.
- Mobile bottom nav: Home, Memories, NGL, Messages, then a "More" hamburger with the rest + admin Dashboard link (when logged in as admin).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Firebase Firestore/Storage is not configured** — no project, no `VITE_FIREBASE_*` env vars. This means all content pages (Memories, Thoughts, Blog, Timeline, Goals, Guestbook, NGL replies, dashboard editors) load but show empty/error states; nothing can be saved yet. This predates the admin-login fix and needs either (a) connecting a real Firebase project, or (b) migrating content storage to the already-provisioned Postgres DB. See the proposed follow-up task.
- Any new code that reads/writes Firestore must guard on `isFirebaseConfigured` (from `src/lib/firebase.ts`) to avoid crashing the page.
- Admin session cookie is `httpOnly`, `SameSite=Lax`, 30-day expiry, signed with `SESSION_SECRET`. Losing/rotating `SESSION_SECRET` invalidates all admin sessions (users just log in again — no user-facing data loss).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
