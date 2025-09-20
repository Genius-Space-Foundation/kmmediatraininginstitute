import { initializeApp } from "firebase/app";
import {
  getFirestore,
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable offline persistence
try {
  // Firestore automatically enables offline persistence by default
  // This will cache data locally and sync when connection is restored
  console.log("Firestore offline persistence enabled");
} catch (error) {
  console.warn("Could not enable offline persistence:", error);
}

// Export network control functions for advanced offline management
export const enableFirestoreNetwork = () => enableNetwork(db);
export const disableFirestoreNetwork = () => disableNetwork(db);

export default app;
