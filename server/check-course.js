const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:chris00@localhost:5432/kmmedia",
});

async function checkCourse() {
  const client = await pool.connect();

  try {
    console.log("🔍 Checking course details...");

    // Get the course that was registered for
    const courseResult = await client.query(
      "SELECT * FROM courses WHERE id = 76"
    );

    if (courseResult.rows.length === 0) {
      console.log("❌ Course not found");
      return;
    }

    const course = courseResult.rows[0];
    console.log("🔍 Course details:", {
      id: course.id,
      name: course.name,
      instructorId: course.instructorId,
      isActive: course.isActive,
    });

    // Check if there are any trainers
    const trainersResult = await client.query(
      "SELECT * FROM users WHERE role = 'trainer'"
    );

    console.log(`📊 Found ${trainersResult.rows.length} trainers`);
    trainersResult.rows.forEach((trainer, index) => {
      console.log(
        `  ${index + 1}. ${trainer.firstName} ${trainer.lastName} (ID: ${
          trainer.id
        })`
      );
    });

    // Check registrations for this course
    const registrationsResult = await client.query(
      'SELECT * FROM registrations WHERE "courseId" = 76'
    );

    console.log(
      `📊 Found ${registrationsResult.rows.length} registrations for course 76`
    );
    registrationsResult.rows.forEach((reg, index) => {
      console.log(
        `  ${index + 1}. User ID: ${reg.userId}, Status: ${
          reg.status
        }, Created: ${reg.createdAt}`
      );
    });
  } catch (error) {
    console.error("❌ Error checking course:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkCourse();







