/**
 * Test Firestore Connection
 *
 * This script tests if we can read from the courses collection
 */

// Set environment variables
process.env.FIREBASE_PROJECT_ID = "kmmedia-training-institute";
process.env.NODE_ENV = "development";

const admin = require("firebase-admin");

// Initialize Firebase Admin
try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log("✅ Firebase Admin initialized");
} catch (error) {
  console.log("Firebase already initialized or error:", error.message);
}

const db = admin.firestore();

async function testFirestore() {
  try {
    console.log("🔍 Testing Firestore connection...");

    // Test reading from courses collection
    const coursesSnapshot = await db.collection("courses").get();
    console.log(`📚 Found ${coursesSnapshot.size} courses in database`);

    if (coursesSnapshot.size > 0) {
      console.log("\n📋 Courses found:");
      coursesSnapshot.forEach((doc, index) => {
        const course = doc.data();
        console.log(`${index + 1}. ${course.name} (ID: ${doc.id})`);
        console.log(`   - Active: ${course.isActive}`);
        console.log(`   - Category: ${course.category}`);
        console.log(`   - Price: GHC${course.price}`);
        console.log("");
      });
    } else {
      console.log("❌ No courses found in database");
    }

    // Test reading with where clause
    console.log("🔍 Testing active courses query...");
    const activeCoursesSnapshot = await db
      .collection("courses")
      .where("isActive", "==", true)
      .get();
    console.log(`✅ Found ${activeCoursesSnapshot.size} active courses`);
  } catch (error) {
    console.error("❌ Error testing Firestore:", error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testFirestore();
