import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let firestore: Firestore | null = null;

/** Whether the server has valid Firebase Admin credentials configured. */
export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
);

function init(): App {
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
      "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Paste the full contents of the service account key file.",
    );
  }

  const apps = getApps();
  app = apps.length > 0 ? apps[0] : initializeApp({ credential: cert(serviceAccount as any) });
  return app;
}

/** Lazily-initialized Firestore Admin client. Throws if not configured. */
export function getAdminFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(init());
  }
  return firestore;
}
