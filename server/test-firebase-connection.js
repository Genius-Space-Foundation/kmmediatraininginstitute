const admin = require("firebase-admin");
const path = require("path");
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

async function testConnection() {
  try {
    console.log("🔥 Initializing Firebase Admin SDK...");

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    const db = admin.firestore();

    console.log("📝 Testing Firestore connection...");

    // Test write operation
    const testDoc = await db
      .collection("test")
      .doc("connection")
      .set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message: "Firebase connection successful",
        testId: Math.random().toString(36).substr(2, 9),
        environment: process.env.NODE_ENV || "development",
      });

    console.log("✅ Firebase connection successful");
    console.log("📄 Test document created");

    // Test read operation
    const docSnapshot = await db.collection("test").doc("connection").get();
    if (docSnapshot.exists) {
      console.log("✅ Read operation successful");
      console.log("📊 Document data:", docSnapshot.data());
    }

    // Clean up test document
    await db.collection("test").doc("connection").delete();
    console.log("🧹 Test document cleaned up");

    // Test collection creation
    const testCollection = db.collection("test");
    const collectionSnapshot = await testCollection.limit(1).get();
    console.log("✅ Collection access successful");

    console.log("\n🎉 All Firebase tests passed!");
    console.log("📋 Project ID:", process.env.FIREBASE_PROJECT_ID);
    console.log("🔗 Database URL:", process.env.FIREBASE_DATABASE_URL);
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    console.error("\n🔍 Troubleshooting tips:");
    console.error("1. Check your Firebase project ID");
    console.error("2. Verify service account permissions");
    console.error("3. Ensure environment variables are set correctly");
    console.error("4. Check network connectivity");

    if (error.code === "PERMISSION_DENIED") {
      console.error(
        "\n🚨 Permission denied - check your Firestore security rules"
      );
    }

    if (error.code === "INVALID_ARGUMENT") {
      console.error("\n🚨 Invalid argument - check your environment variables");
    }
  } finally {
    // Clean up
    if (admin.apps.length > 0) {
      await admin.app().delete();
    }
    process.exit(0);
  }
}

// Run the test
testConnection();

