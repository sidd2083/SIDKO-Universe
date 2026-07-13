import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase (Firestore + Storage) is used as the content data store for the
// public site (memories, blog, thoughts, etc). It is a *separate* concern
// from admin login, which is handled by the API server's own session auth.
//
// No Firebase project is configured in this workspace yet, so we initialize
// defensively: if the config is missing/invalid, the app must not crash on
// load — content-fetching hooks/pages should just show empty/error states.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
  } catch (err) {
    console.error('Firebase failed to initialize:', err);
  }
} else {
  console.warn(
    '[firebase] Not configured (missing VITE_FIREBASE_* env vars). ' +
      'Content features backed by Firestore/Storage will be unavailable until a Firebase project is connected.',
  );
}

export const db = dbInstance as Firestore;
export const storage = storageInstance as FirebaseStorage;
export default app;
