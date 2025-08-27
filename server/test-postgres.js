const { Pool } = require("pg");
require("dotenv").config();

// First, try to connect to the default 'postgres' database
const testPool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: "postgres", // Try default database first
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});

async function testConnection() {
  try {
    console.log("Testing PostgreSQL connection...");
    console.log("Connection details:", {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || "5432",
      database: "postgres", // Testing with default database
      user: process.env.DB_USER || "postgres",
    });

    const client = await testPool.connect();
    console.log("✅ Successfully connected to PostgreSQL!");

    const result = await client.query("SELECT NOW() as current_time");
    console.log("Current database time:", result.rows[0].current_time);

    // Now try to create the kmmedia database
    console.log("\nCreating kmmedia database...");
    try {
      await client.query("CREATE DATABASE kmmedia");
      console.log("✅ Database 'kmmedia' created successfully!");
    } catch (createError) {
      if (createError.code === "42P04") {
        console.log("ℹ️  Database 'kmmedia' already exists.");
      } else {
        console.error("❌ Error creating database:", createError.message);
      }
    }

    client.release();
    await testPool.end();

    console.log("\n✅ PostgreSQL connection test passed!");
    console.log("🎉 You can now start your server!");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 PostgreSQL server is not running.");
      console.log("Please start PostgreSQL service:");
      console.log("  - Windows: Start PostgreSQL service from Services");
      console.log("  - Or run: net start postgresql-x64-15");
    } else if (error.code === "28P01") {
      console.log("\n💡 Authentication failed.");
      console.log("Please check your username and password in .env file.");
      console.log(
        "Current password in .env:",
        process.env.DB_PASSWORD ? "Set" : "Not set"
      );
    } else if (error.code === "3D000") {
      console.log("\n💡 Cannot connect to 'postgres' database.");
      console.log("This might be a permission issue.");
    }

    process.exit(1);
  }
}

testConnection();
