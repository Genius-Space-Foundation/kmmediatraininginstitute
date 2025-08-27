const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:chris00@localhost:5432/kmmedia",
});

async function checkData() {
  const client = await pool.connect();

  try {
    console.log("🔍 Checking database data...");

    // Check users
    const usersResult = await client.query(
      'SELECT id, "firstName", "lastName", email, role FROM users ORDER BY id'
    );
    console.log(`\n👥 Users (${usersResult.rows.length}):`);
    usersResult.rows.forEach((user, index) => {
      console.log(
        `  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${
          user.role
        }`
      );
    });

    // Check courses
    const coursesResult = await client.query(
      "SELECT id, name, description FROM courses ORDER BY id"
    );
    console.log(`\n📚 Courses (${coursesResult.rows.length}):`);
    coursesResult.rows.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.name} (ID: ${course.id})`);
    });

    // Check registrations
    const registrationsResult = await client.query(`
      SELECT r.*, u."firstName", u."lastName", c.name as "courseName" 
      FROM registrations r 
      JOIN users u ON r."userId" = u.id 
      JOIN courses c ON r."courseId" = c.id 
      ORDER BY r."createdAt" DESC
    `);
    console.log(`\n📝 Registrations (${registrationsResult.rows.length}):`);
    registrationsResult.rows.forEach((reg, index) => {
      console.log(
        `  ${index + 1}. ${reg.firstName} ${reg.lastName} - ${
          reg.courseName
        } (${reg.status})`
      );
    });

    // Check course materials
    const materialsResult = await client.query(
      "SELECT COUNT(*) as count FROM course_materials"
    );
    console.log(`\n📖 Course Materials: ${materialsResult.rows[0].count}`);

    // Check assignments
    const assignmentsResult = await client.query(
      "SELECT COUNT(*) as count FROM assignments"
    );
    console.log(`\n📝 Assignments: ${assignmentsResult.rows[0].count}`);

    // Check quizzes
    const quizzesResult = await client.query(
      "SELECT COUNT(*) as count FROM quizzes"
    );
    console.log(`\n🧠 Quizzes: ${quizzesResult.rows[0].count}`);
  } catch (error) {
    console.error("❌ Error checking data:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();




