const { Pool } = require("pg");
require("dotenv").config({ path: "./server/.env" });

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "kmmedia",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});

async function testConnection() {
  try {
    console.log("Testing PostgreSQL connection...");
    console.log("Connection details:", {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || "5432",
      database: process.env.DB_NAME || "kmmedia",
      user: process.env.DB_USER || "postgres",
    });

    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL!");

    const result = await client.query("SELECT NOW() as current_time");
    console.log("Current database time:", result.rows[0].current_time);

    client.release();
    await pool.end();

    console.log("✅ PostgreSQL connection test passed!");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);

    if (error.code === "3D000") {
      console.log('\n💡 The database "kmmedia" does not exist.');
      console.log("Please create it using: CREATE DATABASE kmmedia;");
    } else if (error.code === "ECONNREFUSED") {
      console.log("\n💡 PostgreSQL server is not running.");
      console.log("Please start PostgreSQL service.");
    } else if (error.code === "28P01") {
      console.log("\n💡 Authentication failed.");
      console.log("Please check your username and password in .env file.");
    }

    process.exit(1);
  }
}

testConnection();
