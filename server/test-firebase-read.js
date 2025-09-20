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

async function testReadConnection() {
  try {
    console.log("🔥 Initializing Firebase Admin SDK...");

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    const db = admin.firestore();

    console.log("📝 Testing Firestore read connection...");

    // Test simple read operation
    const testCollection = db.collection("test");
    const snapshot = await testCollection.limit(1).get();

    console.log("✅ Firebase read connection successful");
    console.log(`📊 Found ${snapshot.size} documents in test collection`);

    console.log("\n🎉 Firebase is ready for migration!");
  } catch (error) {
    console.error("❌ Firebase connection failed:", error.message);

    if (error.code === 7) {
      console.error(
        "\n🚨 Permission denied - please update Firestore rules in Firebase Console"
      );
      console.error("Go to: https://console.firebase.google.com/");
      console.error("Select your project → Firestore Database → Rules");
      console.error("Set rules to: allow read, write: if true;");
    }
  } finally {
    // Clean up
    if (admin.apps.length > 0) {
      await admin.app().delete();
    }
    process.exit(0);
  }
}

testReadConnection();

