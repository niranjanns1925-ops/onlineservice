import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const isConfigValid = firebaseConfig && (firebaseConfig as any).apiKey;

if (isConfigValid) {
  app = initializeApp(firebaseConfig as any);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Initialize with dummy values to prevent module-level errors, 
  // but we'll check validity before usage.
  const dummyConfig = {
    apiKey: "placeholder",
    authDomain: "placeholder",
    projectId: "placeholder",
    storageBucket: "placeholder",
    messagingSenderId: "placeholder",
    appId: "placeholder"
  };
  app = initializeApp(dummyConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
export const isFirebaseConfigured = isConfigValid;
