/**
 * Fix Course Status
 *
 * This script updates courses in Firestore to have the correct isActive field
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

async function fixCourseStatus() {
  try {
    console.log("🔍 Fetching courses from database...");

    // Get all courses
    const coursesSnapshot = await db.collection("courses").get();
    console.log(`📚 Found ${coursesSnapshot.size} courses in database`);

    if (coursesSnapshot.size === 0) {
      console.log("❌ No courses found to update");
      return;
    }

    const batch = db.batch();
    let updateCount = 0;

    coursesSnapshot.forEach((doc) => {
      const course = doc.data();
      console.log(`\n📋 Course: ${course.title || course.name}`);
      console.log(`   - Current status: ${course.status}`);
      console.log(`   - Current isActive: ${course.isActive}`);

      // Update the course to have isActive field
      const updateData = {
        isActive: course.status === "active" || course.isActive === true,
        updatedAt: new Date().toISOString(),
      };

      batch.update(doc.ref, updateData);
      updateCount++;

      console.log(`   - Will set isActive to: ${updateData.isActive}`);
    });

    if (updateCount > 0) {
      console.log(`\n🔄 Updating ${updateCount} courses...`);
      await batch.commit();
      console.log("✅ Courses updated successfully!");

      // Verify the update
      console.log("\n🔍 Verifying updates...");
      const updatedSnapshot = await db.collection("courses").get();
      updatedSnapshot.forEach((doc) => {
        const course = doc.data();
        console.log(
          `✅ ${course.title || course.name}: isActive = ${course.isActive}`
        );
      });
    } else {
      console.log("ℹ️  No courses needed updating");
    }
  } catch (error) {
    console.error("❌ Error updating courses:", error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixCourseStatus();
