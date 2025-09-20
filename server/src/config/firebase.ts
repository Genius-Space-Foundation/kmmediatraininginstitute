/**
 * Firebase Configuration
 *
 * This module handles Firebase configuration for the application.
 */

import admin from "firebase-admin";
import { config } from "./index";

export interface FirebaseConfig {
  projectId: string;
  serviceAccountPath?: string;
  storageBucket?: string;
  databaseURL?: string;
}

export const firebaseConfig: FirebaseConfig = {
  projectId: config.firebase.projectId,
  serviceAccountPath: config.firebase.serviceAccountPath,
  storageBucket: config.firebase.storageBucket,
  databaseURL: config.firebase.databaseURL,
};

// Initialize Firebase Admin SDK if not already initialized
let bucket: admin.storage.Storage | null = null;

try {
  if (!admin.apps.length) {
    // Service account configuration
    const serviceAccount = {
      type: "service_account",
      project_id: config.firebase.projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
        process.env.FIREBASE_CLIENT_EMAIL || ""
      )}`,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: config.firebase.storageBucket,
      databaseURL: config.firebase.databaseURL,
    });
  }

  // Get storage bucket
  if (config.firebase.storageBucket) {
    bucket = admin.storage();
  }
} catch (error) {
  console.warn("Firebase initialization failed:", error);
}

export { bucket };

// Environment variables for Firebase
export const firebaseEnv = {
  // Firebase Admin SDK
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,

  // Firebase Client SDK (for frontend)
  REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
  REACT_APP_FIREBASE_MEASUREMENT_ID:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export default firebaseConfig;
