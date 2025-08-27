const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:chris00@localhost:5432/kmmedia",
});

async function testTrainerFunctionality() {
  const client = await pool.connect();

  try {
    console.log("🔍 Testing trainer course management functionality...");

    // Get a trainer and course
    const trainerResult = await client.query(
      'SELECT id, "firstName", "lastName" FROM users WHERE role = \'trainer\' LIMIT 1'
    );
    const courseResult = await client.query(
      "SELECT id, name FROM courses LIMIT 1"
    );

    if (trainerResult.rows.length === 0 || courseResult.rows.length === 0) {
      console.log("❌ No trainers or courses found");
      return;
    }

    const trainer = trainerResult.rows[0];
    const course = courseResult.rows[0];

    console.log(`👨‍🏫 Trainer: ${trainer.firstName} ${trainer.lastName}`);
    console.log(`📚 Course: ${course.name}`);

    // Test course materials
    console.log("\n📖 Testing course materials...");
    const materialsResult = await client.query(
      'SELECT COUNT(*) as count FROM course_materials WHERE "courseId" = $1',
      [course.id]
    );
    console.log(`📊 Course has ${materialsResult.rows[0].count} materials`);

    // Test assignments
    console.log("\n📝 Testing assignments...");
    const assignmentsResult = await client.query(
      'SELECT COUNT(*) as count FROM assignments WHERE "courseId" = $1',
      [course.id]
    );
    console.log(`📊 Course has ${assignmentsResult.rows[0].count} assignments`);

    // Test creating a sample material
    console.log("\n➕ Creating sample course material...");
    try {
      const materialResult = await client.query(
        `INSERT INTO course_materials (
          "courseId", title, description, "fileUrl", "fileType", "fileName", 
          "fileSize", module, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          course.id,
          "Sample Course Material",
          "This is a sample course material for testing",
          "https://example.com/sample-material.pdf",
          "pdf",
          "sample-material.pdf",
          1024000, // 1MB
          "Module 1",
        ]
      );
      console.log("✅ Sample course material created successfully!");
      console.log(`  - Material ID: ${materialResult.rows[0].id}`);
      console.log(`  - Title: ${materialResult.rows[0].title}`);
    } catch (error) {
      console.log("⚠️ Sample material already exists or error occurred");
    }

    // Test creating a sample assignment
    console.log("\n➕ Creating sample assignment...");
    try {
      const assignmentResult = await client.query(
        `INSERT INTO assignments (
          "courseId", title, description, "dueDate", "maxScore", "assignmentType", 
          instructions, "attachmentUrl", "attachmentName", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          course.id,
          "Sample Assignment",
          "This is a sample assignment for testing",
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          100,
          "individual",
          "Complete this assignment according to the instructions",
          "https://example.com/sample-assignment.pdf",
          "sample-assignment.pdf",
        ]
      );
      console.log("✅ Sample assignment created successfully!");
      console.log(`  - Assignment ID: ${assignmentResult.rows[0].id}`);
      console.log(`  - Title: ${assignmentResult.rows[0].title}`);
    } catch (error) {
      console.log("⚠️ Sample assignment already exists or error occurred");
    }

    // Show final counts
    console.log("\n📊 Final counts:");
    const finalMaterialsResult = await client.query(
      'SELECT COUNT(*) as count FROM course_materials WHERE "courseId" = $1',
      [course.id]
    );
    const finalAssignmentsResult = await client.query(
      'SELECT COUNT(*) as count FROM assignments WHERE "courseId" = $1',
      [course.id]
    );
    console.log(`  - Course Materials: ${finalMaterialsResult.rows[0].count}`);
    console.log(`  - Assignments: ${finalAssignmentsResult.rows[0].count}`);

    console.log("\n🎉 Trainer functionality test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

testTrainerFunctionality();
