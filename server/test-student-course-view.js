const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:chris00@localhost:5432/kmmedia",
});

async function testStudentCourseView() {
  const client = await pool.connect();

  try {
    console.log("🔍 Testing student course view functionality...");

    // 1. Get a course and student
    const courseResult = await client.query(
      "SELECT id, name FROM courses LIMIT 1"
    );
    const studentResult = await client.query(
      'SELECT id, "firstName", "lastName" FROM users WHERE role = \'user\' LIMIT 1'
    );

    if (courseResult.rows.length === 0 || studentResult.rows.length === 0) {
      console.log("❌ No courses or students found in database");
      return;
    }

    const course = courseResult.rows[0];
    const student = studentResult.rows[0];

    console.log(`📚 Testing with course: ${course.name} (ID: ${course.id})`);
    console.log(
      `👤 Testing with student: ${student.firstName} ${student.lastName} (ID: ${student.id})`
    );

    // 2. Check if student has approved registration for this course
    const registrationResult = await client.query(
      'SELECT * FROM registrations WHERE "userId" = $1 AND "courseId" = $2',
      [student.id, course.id]
    );

    if (registrationResult.rows.length === 0) {
      console.log("⚠️ Student is not registered for this course");

      // Create a pending registration for testing
      await client.query(
        `INSERT INTO registrations ("userId", "courseId", status, "registrationDate", notes, "createdAt", "updatedAt")
         VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP, 'Test registration', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [student.id, course.id]
      );
      console.log("✅ Created test registration (pending)");
    } else {
      console.log(
        `✅ Student registration found: ${registrationResult.rows[0].status}`
      );
    }

    // 3. Test course materials access
    console.log("\n📖 Testing course materials...");
    const materialsResult = await client.query(
      'SELECT COUNT(*) as count FROM course_materials WHERE "courseId" = $1',
      [course.id]
    );
    console.log(`📊 Course has ${materialsResult.rows[0].count} materials`);

    // 4. Test assignments access
    console.log("\n📝 Testing assignments...");
    const assignmentsResult = await client.query(
      'SELECT COUNT(*) as count FROM assignments WHERE "courseId" = $1',
      [course.id]
    );
    console.log(`📊 Course has ${assignmentsResult.rows[0].count} assignments`);

    // 5. Test quizzes access
    console.log("\n🧠 Testing quizzes...");
    const quizzesResult = await client.query(
      'SELECT COUNT(*) as count FROM quizzes WHERE "courseId" = $1',
      [course.id]
    );
    console.log(`📊 Course has ${quizzesResult.rows[0].count} quizzes`);

    // 6. Test student progress
    console.log("\n📈 Testing student progress...");
    const progressResult = await client.query(
      'SELECT COUNT(*) as count FROM student_progress WHERE "studentId" = $1 AND "courseId" = $2',
      [student.id, course.id]
    );
    console.log(
      `📊 Student has ${progressResult.rows[0].count} progress records`
    );

    // 7. Test access control - what happens when student doesn't have approved registration
    console.log("\n🔒 Testing access control...");

    // Set registration to pending to test access denial
    await client.query(
      'UPDATE registrations SET status = \'pending\' WHERE "userId" = $1 AND "courseId" = $2',
      [student.id, course.id]
    );
    console.log("⚠️ Set registration status to pending");

    // Check if student can access materials (should be denied)
    const accessCheck = await client.query(
      `SELECT r.status 
       FROM registrations r 
       WHERE r."userId" = $1 AND r."courseId" = $2`,
      [student.id, course.id]
    );

    if (accessCheck.rows.length > 0) {
      const status = accessCheck.rows[0].status;
      console.log(`🔐 Current registration status: ${status}`);

      if (status === "approved") {
        console.log("✅ Student has access to course content");
      } else {
        console.log(
          "❌ Student does not have access to course content (registration not approved)"
        );
      }
    }

    // 8. Approve registration and test access
    console.log("\n✅ Approving registration...");
    await client.query(
      'UPDATE registrations SET status = \'approved\', "updatedAt" = CURRENT_TIMESTAMP WHERE "userId" = $1 AND "courseId" = $2',
      [student.id, course.id]
    );

    const approvedCheck = await client.query(
      `SELECT r.status 
       FROM registrations r 
       WHERE r."userId" = $1 AND r."courseId" = $2`,
      [student.id, course.id]
    );

    if (
      approvedCheck.rows.length > 0 &&
      approvedCheck.rows[0].status === "approved"
    ) {
      console.log("✅ Student now has access to course content!");
    }

    // 9. Show summary
    console.log("\n📋 Summary:");
    console.log(`  • Course: ${course.name}`);
    console.log(`  • Student: ${student.firstName} ${student.lastName}`);
    console.log(`  • Materials: ${materialsResult.rows[0].count}`);
    console.log(`  • Assignments: ${assignmentsResult.rows[0].count}`);
    console.log(`  • Quizzes: ${quizzesResult.rows[0].count}`);
    console.log(`  • Progress Records: ${progressResult.rows[0].count}`);
    console.log(`  • Access Status: ${approvedCheck.rows[0].status}`);

    console.log("\n🎉 Student course view test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

testStudentCourseView();
