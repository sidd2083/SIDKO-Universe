import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase is configured when the minimum required fields are present.
// authDomain is required for Google Sign-In.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let authInstance: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
    authInstance = getAuth(app);
  } catch (err) {
    console.error('Firebase failed to initialize:', err);
  }
} else {
  console.warn(
    '[firebase] Not fully configured (missing VITE_FIREBASE_* env vars). ' +
      'Content features backed by Firestore/Storage will be unavailable until a Firebase project is connected.',
  );
}

export const db = dbInstance as Firestore;
export const storage = storageInstance as FirebaseStorage;
export const auth = authInstance as Auth;
export default app;
