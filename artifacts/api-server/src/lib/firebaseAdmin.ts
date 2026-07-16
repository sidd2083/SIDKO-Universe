import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

// ── Full app: Firestore + Auth ─────────────────────────────────────────────────
// Requires FIREBASE_SERVICE_ACCOUNT_KEY (JSON string from Firebase console).
let app: App | null = null;
let firestore: Firestore | null = null;

/** Whether the server has full Firebase Admin credentials (needed for Firestore writes). */
export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
);

function initFullApp(): App {
  if (app) return app;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY must be set to use Firestore from the server.",
    );
  }

  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Paste the full service account key file contents.",
    );
  }

  const apps = getApps();
  app =
    apps.find((a) => a.name === "[DEFAULT]") ??
    initializeApp({ credential: cert(serviceAccount as any) });
  return app;
}

/** Lazily-initialized Firestore Admin client. Throws if service account not configured. */
export function getAdminFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(initFullApp());
  }
  return firestore;
}

// ── Auth-only app: ID token verification ──────────────────────────────────────
// Only needs FIREBASE_PROJECT_ID — no service account required.
// Used to verify Google Sign-In ID tokens server-side.
let authApp: App | null = null;

function getAuthApp(): App {
  // If the full app is already initialised, it can verify tokens too
  if (app) return app;

  // Check Firebase registry for an existing default app
  const defaultApp = getApps().find((a) => a.name === "[DEFAULT]");
  if (defaultApp) {
    app = defaultApp;
    return app;
  }

  // Fall back to a minimal app that only needs the project ID
  if (authApp) return authApp;

  const existingAuthApp = getApps().find((a) => a.name === "auth-only");
  if (existingAuthApp) {
    authApp = existingAuthApp;
    return authApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "FIREBASE_PROJECT_ID must be set so the server can verify Google Sign-In tokens.",
    );
  }

  authApp = initializeApp({ projectId }, "auth-only");
  return authApp;
}

/**
 * Firebase Auth Admin client.
 * Can verify ID tokens using just a project ID — no service account needed.
 */
export function getAdminAuth(): Auth {
  return getAuth(getAuthApp());
}
