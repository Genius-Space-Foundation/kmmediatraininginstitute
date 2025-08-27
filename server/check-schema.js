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
    console.log("🔍 Checking registrations table schema...");

    // Get table structure
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'registrations' 
      ORDER BY ordinal_position
    `);

    console.log("📋 Registrations table columns:");
    schemaResult.rows.forEach((col, index) => {
      console.log(
        `  ${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${
          col.is_nullable
        }`
      );
    });

    // Check if table exists and has any data
    const countResult = await client.query(
      "SELECT COUNT(*) as count FROM registrations"
    );
    console.log(`📊 Total registrations: ${countResult.rows[0].count}`);

    // Check payments table too
    const paymentsSchemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payments' 
      ORDER BY ordinal_position
    `);

    console.log("\n📋 Payments table columns:");
    paymentsSchemaResult.rows.forEach((col, index) => {
      console.log(
        `  ${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${
          col.is_nullable
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error checking schema:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();
