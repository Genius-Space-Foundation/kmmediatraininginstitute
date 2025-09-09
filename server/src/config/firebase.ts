import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    // Check if Firebase environment variables are properly configured
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    // Only initialize if all required Firebase credentials are present and valid
    if (!projectId || projectId === 'your-firebase-project-id' || 
        !clientEmail || clientEmail.includes('xxxxx') ||
        !privateKey || privateKey.includes('YOUR_PRIVATE_KEY_HERE') ||
        !storageBucket || storageBucket === 'your-project.appspot.com') {
      console.warn('Firebase credentials not properly configured. Skipping Firebase initialization.');
      return null;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket,
    });
  }
  return admin.app();
};

// Get Firebase Storage instance
export const getFirebaseStorage = () => {
  const app = initializeFirebase();
  if (!app) {
    throw new Error('Firebase is not initialized. Please configure Firebase credentials.');
  }
  return getStorage(app);
};

export default admin;
