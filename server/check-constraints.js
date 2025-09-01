const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:chris00@localhost:5432/kmmedia",
});

async function checkConstraints() {
  const client = await pool.connect();

  try {
    console.log("🔍 Checking table constraints...");

    // Check assignments table constraints
    const assignmentConstraints = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'assignments'::regclass
    `);

    console.log("📋 Assignments table constraints:");
    assignmentConstraints.rows.forEach((constraint, index) => {
      console.log(
        `  ${index + 1}. ${constraint.conname}: ${constraint.definition}`
      );
    });

    // Check quiz_questions table constraints
    const quizConstraints = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'quiz_questions'::regclass
    `);

    console.log("\n📋 Quiz questions table constraints:");
    quizConstraints.rows.forEach((constraint, index) => {
      console.log(
        `  ${index + 1}. ${constraint.conname}: ${constraint.definition}`
      );
    });

    // Check course_materials table constraints
    const materialConstraints = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'course_materials'::regclass
    `);

    console.log("\n📋 Course materials table constraints:");
    materialConstraints.rows.forEach((constraint, index) => {
      console.log(
        `  ${index + 1}. ${constraint.conname}: ${constraint.definition}`
      );
    });
  } catch (error) {
    console.error("❌ Error checking constraints:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkConstraints();






