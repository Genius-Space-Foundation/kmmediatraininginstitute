const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
    process.env.FIREBASE_CLIENT_EMAIL
  )}`,
};

async function testAuthOnly() {
  try {
    console.log("🔥 Testing Firebase Admin SDK Authentication...");
    console.log("📋 Project ID:", process.env.FIREBASE_PROJECT_ID);
    console.log("📧 Service Account:", process.env.FIREBASE_CLIENT_EMAIL);

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log("✅ Firebase Admin SDK initialized successfully");
    console.log("✅ Service account authentication successful");

    const db = admin.firestore();
    console.log("✅ Firestore instance created");

    // Try to get project info
    console.log("📊 Testing project access...");

    console.log("\n🎉 Authentication is working!");
    console.log(
      "The issue might be with Firestore rules or service account permissions."
    );
  } catch (error) {
    console.error("❌ Authentication failed:", error.message);
    console.error("Error code:", error.code);
  } finally {
    // Clean up
    if (admin.apps.length > 0) {
      await admin.app().delete();
    }
    process.exit(0);
  }
}

testAuthOnly();

