import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase client config is intentionally public — security is enforced
// via Firebase Security Rules and server-side token verification, not by
// hiding these values. Env vars override for flexibility; hardcoded values
// are the safe fallback so the app always initialises in dev/preview.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyCw3Rx0pIDnEk1WDKLOpffax5BPD6C9Psk',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'sidhub-a359f.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'sidhub-a359f',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'sidhub-a359f.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '482346208574',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:482346208574:web:2a5f3149389aa6e391306f',
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
