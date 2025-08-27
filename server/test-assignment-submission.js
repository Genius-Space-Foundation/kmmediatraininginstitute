const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:chris00@localhost:5432/kmmedia",
});

async function testAssignmentSubmission() {
  const client = await pool.connect();

  try {
    console.log("🔍 Testing assignment submission functionality...");

    // Get student and assignment
    const studentResult = await client.query(
      'SELECT id, "firstName", "lastName" FROM users WHERE role = \'user\' LIMIT 1'
    );
    const assignmentResult = await client.query(
      'SELECT id, title, "courseId" FROM assignments LIMIT 1'
    );

    if (studentResult.rows.length === 0 || assignmentResult.rows.length === 0) {
      console.log("❌ No students or assignments found");
      return;
    }

    const student = studentResult.rows[0];
    const assignment = assignmentResult.rows[0];

    console.log(`👤 Student: ${student.firstName} ${student.lastName}`);
    console.log(`📝 Assignment: ${assignment.title}`);

    // Check registration
    const registrationResult = await client.query(
      'SELECT * FROM registrations WHERE "userId" = $1 AND "courseId" = $2',
      [student.id, assignment.courseId]
    );

    if (registrationResult.rows.length === 0) {
      await client.query(
        `INSERT INTO registrations ("userId", "courseId", status, "registrationDate", notes, "createdAt", "updatedAt")
         VALUES ($1, $2, 'approved', CURRENT_TIMESTAMP, 'Test registration', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [student.id, assignment.courseId]
      );
      console.log("✅ Created approved registration");
    }

    // Check existing submissions
    const existingSubmissions = await client.query(
      'SELECT * FROM assignment_submissions WHERE "assignmentId" = $1 AND "studentId" = $2',
      [assignment.id, student.id]
    );

    console.log(`📊 Existing submissions: ${existingSubmissions.rows.length}`);

    if (existingSubmissions.rows.length === 0) {
      // Create test submission
      const insertResult = await client.query(
        `INSERT INTO assignment_submissions (
          "assignmentId", "studentId", "submissionText", "fileUrl", "fileName", 
          "submittedAt", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          assignment.id,
          student.id,
          "Test submission text",
          "https://example.com/test.pdf",
          "test.pdf",
        ]
      );

      console.log("✅ Test submission created successfully!");
      console.log(`  - Submission ID: ${insertResult.rows[0].id}`);
    }

    console.log("🎉 Assignment submission test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

testAssignmentSubmission();
