const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:chris00@localhost:5432/kmmedia",
});

async function checkSchema() {
  const client = await pool.connect();

  try {
    console.log("🔍 Checking course_materials table schema...");

    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'course_materials' 
      ORDER BY ordinal_position
    `);

    console.log("📋 Course materials table columns:");
    schemaResult.rows.forEach((col, index) => {
      console.log(
        `  ${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${
          col.is_nullable
        }`
      );
    });

    // Check other tables too
    const tables = [
      "assignments",
      "quizzes",
      "quiz_questions",
      "assignment_submissions",
      "quiz_attempts",
      "student_progress",
    ];

    for (const table of tables) {
      console.log(`\n📋 ${table} table columns:`);
      const tableSchemaResult = await client.query(
        `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `,
        [table]
      );

      tableSchemaResult.rows.forEach((col, index) => {
        console.log(
          `  ${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${
            col.is_nullable
          }`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error checking schema:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();






