const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:chris00@localhost:5432/kmmedia'
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔧 Running course materials migration...');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations/create_course_materials_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration in a transaction
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');

    console.log('✅ Course materials migration completed successfully!');

    // Verify tables were created
    const tables = [
      'course_materials',
      'assignments',
      'quizzes',
      'quiz_questions',
      'assignment_submissions',
      'quiz_attempts',
      'student_progress'
    ];

    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [table]);

      if (result.rows[0].exists) {
        console.log(`✅ Table '${table}' created successfully`);
      } else {
        console.log(`❌ Table '${table}' was not created`);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();







