const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Database configuration - using the same config as the main app
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "kmmedia",
  user: "postgres",
  password: "postgres", // Update this to your actual password
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log("Starting payment migration...");

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      "src",
      "database",
      "payment-migration.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Execute the migration
    await client.query(migrationSQL);

    console.log("Payment migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    if (error.code === "42710") {
      console.log("Some columns/tables already exist, which is fine.");
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
